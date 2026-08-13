import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../lib/axios";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const refreshCart = useCallback(async () => {
    try {
      const res = await api.get("/cart");
      setCart(res.data);
    } catch (err) {
      console.error("Failed to load cart", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (variantId, quantity = 1, measurements) => {
    const res = await api.post("/cart/items", {
      variantId,
      quantity,
      ...(measurements ? { measurements } : {}),
    });
    setCart(res.data);
    if (typeof window.gtag === "function") {
      const item = res.data.items.find((i) => i.variant.id === variantId);
      if (item) {
        window.gtag("event", "add_to_cart", {
          currency: "NGN",
          value: Number(item.variant.product.price) * quantity,
          items: [
            {
              item_id: item.variant.product.id,
              item_name: item.variant.product.name,
              price: Number(item.variant.product.price),
              quantity,
            },
          ],
        });
      }
    }
    if (typeof window.ttq !== "undefined") {
      const item = res.data.items.find((i) => i.variant.id === variantId);
      if (item) {
        window.ttq.track("AddToCart", {
          content_id: item.variant.product.id,
          content_name: item.variant.product.name,
          quantity,
          price: Number(item.variant.product.price),
          value: Number(item.variant.product.price) * quantity,
          currency: "NGN",
        });
      }
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    const res = await api.put(`/cart/items/${itemId}`, { quantity });
    setCart(res.data);
  };

  const removeItem = async (itemId) => {
    const res = await api.delete(`/cart/items/${itemId}`);
    setCart(res.data);
  };

  const updateMeasurements = async (itemId, measurements) => {
    const res = await api.put(`/cart/items/${itemId}/measurements`, {
      measurements,
    });
    setCart(res.data);
  };

  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.items.reduce(
    (sum, i) => sum + Number(i.variant.product.price) * i.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        isOpen,
        setIsOpen,
        addToCart,
        updateQuantity,
        removeItem,
        updateMeasurements,
        refreshCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
