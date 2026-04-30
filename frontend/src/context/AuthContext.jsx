import { createContext, useState, useEffect } from "react";
import { api } from "../lib/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      setUser({ userId: data.userId, email: data.email, name: data.name });
    } catch (err) {
      throw new Error(err.response?.data?.message || "Credenciales inválidas");
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post("/api/auth/register", { name, email, password });
      localStorage.setItem("token", data.token);
      setUser({ userId: data.userId, email: data.email, name: data.name });
    } catch (err) {
      throw new Error(err.response?.data?.message || "No se pudo registrar");
    }
  };

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
