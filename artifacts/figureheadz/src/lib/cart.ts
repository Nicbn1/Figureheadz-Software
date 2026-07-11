import { useGetCart, useCreateCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useCallback, useSyncExternalStore } from "react";

const CART_ID_KEY = "figureheadz_cart_id";

// Shared external store so every component using useCartId() (Header, Cart,
// Checkout, ...) observes the same cart id. Previously each hook call kept
// its own useState seeded from localStorage, so clearing the cart in one
// component (e.g. Checkout after placing an order) never notified the
// others (e.g. the Header's cart icon), leaving it stuck showing stale items.
let cartIdListeners = new Set<() => void>();

function getCartIdSnapshot() {
  return localStorage.getItem(CART_ID_KEY);
}

function setCartIdValue(value: string | null) {
  if (value) {
    localStorage.setItem(CART_ID_KEY, value);
  } else {
    localStorage.removeItem(CART_ID_KEY);
  }
  cartIdListeners.forEach((listener) => listener());
}

function subscribeToCartId(listener: () => void) {
  cartIdListeners.add(listener);
  return () => {
    cartIdListeners.delete(listener);
  };
}

export function useCartId() {
  const cartId = useSyncExternalStore(subscribeToCartId, getCartIdSnapshot, () => null);
  const createCart = useCreateCart();

  const getOrCreateCart = useCallback(async () => {
    const currentId = getCartIdSnapshot();
    if (currentId) {
      return currentId;
    }
    const cart = await createCart.mutateAsync();
    setCartIdValue(cart.id);
    return cart.id;
  }, [createCart]);

  const clearCart = useCallback(() => {
    setCartIdValue(null);
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
