import { useGetCart, useCreateCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

const CART_ID_KEY = "figureheadz_cart_id";

export function useCartId() {
  const [cartId, setCartId] = useState<string | null>(() => localStorage.getItem(CART_ID_KEY));
  const createCart = useCreateCart();

  const getOrCreateCart = useCallback(async () => {
    let currentId = localStorage.getItem(CART_ID_KEY);
    if (currentId) {
      return currentId;
    }
    const cart = await createCart.mutateAsync();
    localStorage.setItem(CART_ID_KEY, cart.id);
    setCartId(cart.id);
    return cart.id;
  }, [createCart]);

  const clearCart = useCallback(() => {
    localStorage.removeItem(CART_ID_KEY);
    setCartId(null);
  }, []);

  return { cartId, getOrCreateCart, clearCart };
}

export function useCart() {
  const { cartId } = useCartId();
  
  return useGetCart(cartId || "", {
    query: {
      enabled: !!cartId,
      queryKey: getGetCartQueryKey(cartId || ""),
    }
  });
}
