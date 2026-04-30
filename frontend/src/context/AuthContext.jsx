import { createContext, useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";

export const AuthContext = createContext();

const persistUser = (user) => {
  if (user) localStorage.setItem("user", JSON.stringify(user));
  else localStorage.removeItem("user");
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    persistUser(user);
  }, [user]);

  const fetchProfile = useCallback(async (base) => {
    try {
      const { data } = await api.get("/api/users/me");
      return {
        ...base,
        name: data?.name || base.name || null,
        address: data?.address || null,
      };
    } catch {
      return base;
    }
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      const base = {
        userId: data.user?.id,
        email: data.user?.email || email,
        name: null,
      };
      const enriched = await fetchProfile(base);
      setUser(enriched);
    } catch (err) {
      throw new Error(err.response?.data?.message || "Credenciales inválidas");
    }
  };

  const register = async (name, email, password) => {
    try {
      await api.post("/api/auth/register", { email, password });
      const { data } = await api.post("/api/auth/login", { email, password });
      localStorage.setItem("token", data.token);

      try {
        await api.put("/api/users/me", { name, address: "" });
      } catch {
        // no bloqueamos el registro si el users-service falla
      }

      const base = {
        userId: data.user?.id,
        email: data.user?.email || email,
        name: name || null,
      };
      const enriched = await fetchProfile(base);
      setUser(enriched);
    } catch (err) {
      throw new Error(err.response?.data?.message || "No se pudo registrar");
    }
  };

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const enriched = await fetchProfile(user);
    setUser(enriched);
  }, [user, fetchProfile]);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
