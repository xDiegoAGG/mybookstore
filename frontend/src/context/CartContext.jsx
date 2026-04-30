import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";
import { AuthContext } from "./AuthContext.jsx";

export const CartContext = createContext();

const EMPTY_CART = { items: [] };

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [cart, setCart] = useState(EMPTY_CART);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(EMPTY_CART);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get("/api/cart");
      setCart(data || EMPTY_CART);
    } catch (err) {
      console.error("Error cargando carrito:", err);
      setCart(EMPTY_CART);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = async (bookId, qty = 1) => {
    const { data } = await api.post("/api/cart/items", { bookId, qty });
    setCart(data);
    return data;
  };

  const removeItem = async (bookId) => {
    const { data } = await api.delete(`/api/cart/items/${bookId}`);
    setCart(data);
    return data;
  };

  const clearLocal = () => setCart(EMPTY_CART);

  const itemCount =
    cart?.items?.reduce((acc, item) => acc + Number(item.qty || 0), 0) || 0;

  return (
    <CartContext.Provider
      value={{ cart, loading, refresh, addItem, removeItem, clearLocal, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
};
