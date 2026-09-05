"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { CartContextValue, CartItem, ResolvedCartItem } from "@/types/cart";
import { getProductById } from "@/constants/products";

const STORAGE_KEY = "luna-cart-v1";

/* Источник правды — localStorage вне React, компоненты подписаны через
 * useSyncExternalStore (тот же паттерн, что useIsTouch.ts). Это избегает
 * setState-в-эффекте на маунте и связанного с ним hydration-мисматча:
 * getServerSnapshot стабильно отдаёт [] на сервере, а после гидратации
 * React сам ресинхронизирует со снапшотом клиента. */
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined = undefined;
let cachedItems: CartItem[] = [];

function readCart(): CartItem[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedItems;
  cachedRaw = raw;
  try {
    cachedItems = raw ? JSON.parse(raw) : [];
  } catch {
    cachedItems = [];
  }
  return cachedItems;
}

function writeCart(items: CartItem[]) {
  cachedItems = items;
  cachedRaw = JSON.stringify(items);
  try {
    window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  } catch {
    // localStorage недоступен (приватный режим и т.п.) — корзина живёт в памяти вкладки
  }
  listeners.forEach((l) => l());
}

function subscribeCart(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

const EMPTY_CART: CartItem[] = [];

function getServerSnapshot(): CartItem[] {
  return EMPTY_CART;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribeCart, readCart, getServerSnapshot);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const addItem = useCallback((productId: string, qty = 1) => {
    const current = readCart();
    const existing = current.find((i) => i.productId === productId);
    const next = existing
      ? current.map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity + qty } : i
        )
      : [...current, { productId, quantity: qty }];
    writeCart(next);
    setDrawerOpen(true);
  }, []);

  const removeItem = useCallback((productId: string) => {
    writeCart(readCart().filter((i) => i.productId !== productId));
  }, []);

  const setQuantity = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      writeCart(readCart().filter((i) => i.productId !== productId));
      return;
    }
    writeCart(
      readCart().map((i) => (i.productId === productId ? { ...i, quantity: qty } : i))
    );
  }, []);

  const clearCart = useCallback(() => writeCart([]), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const resolvedItems = useMemo<ResolvedCartItem[]>(() => {
    return items
      .map((item) => {
        const product = getProductById(item.productId);
        return product ? { product, quantity: item.quantity } : null;
      })
      .filter((v): v is ResolvedCartItem => v !== null);
  }, [items]);

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => resolvedItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [resolvedItems]
  );

  const value: CartContextValue = {
    items,
    resolvedItems,
    itemCount,
    subtotal,
    isDrawerOpen,
    addItem,
    removeItem,
    setQuantity,
    clearCart,
    openDrawer,
    closeDrawer,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
