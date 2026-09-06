"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type {
  AddCartItemInput,
  CartContextValue,
  CartItem,
  CartItemKey,
  ResolvedCartItem,
} from "@/types/cart";

const STORAGE_KEY = "di-smart-cart-v1";

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

function sameKey(a: CartItemKey, b: CartItemKey): boolean {
  return a.productId === b.productId && a.variantId === b.variantId && a.colorValueId === b.colorValueId;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribeCart, readCart, getServerSnapshot);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [fetchedItems, setFetchedItems] = useState<ResolvedCartItem[]>([]);
  /* Ключ items, для которого fetchedItems реально получены с сервера —
   * сравнение с текущим itemsKey ниже даёт "isResolving" без отдельного
   * boolean-state и без синхронного setState в теле эффекта (иначе
   * react-hooks/set-state-in-effect ругается на cascading render). */
  const [fetchedKey, setFetchedKey] = useState<string | null>(null);
  /* Защита от гонки: быстрый клик "+"/"-" может запустить резолв дважды —
   * применяем только ответ самого последнего запроса. */
  const requestIdRef = useRef(0);

  const itemsKey = useMemo(() => JSON.stringify(items), [items]);

  const addItem = useCallback((input: AddCartItemInput) => {
    const key: CartItemKey = {
      productId: input.productId,
      variantId: input.variantId ?? null,
      colorValueId: input.colorValueId ?? null,
    };
    const qty = input.qty ?? 1;
    const current = readCart();
    const existing = current.find((i) => sameKey(i, key));
    const next = existing
      ? current.map((i) => (sameKey(i, key) ? { ...i, quantity: i.quantity + qty } : i))
      : [...current, { ...key, quantity: qty }];
    writeCart(next);
    setDrawerOpen(true);
  }, []);

  const removeItem = useCallback((key: CartItemKey) => {
    writeCart(readCart().filter((i) => !sameKey(i, key)));
  }, []);

  const setQuantity = useCallback((key: CartItemKey, qty: number) => {
    if (qty <= 0) {
      writeCart(readCart().filter((i) => !sameKey(i, key)));
      return;
    }
    writeCart(readCart().map((i) => (sameKey(i, key) ? { ...i, quantity: qty } : i)));
  }, []);

  const clearCart = useCallback(() => writeCart([]), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  useEffect(() => {
    if (items.length === 0) return;

    const requestId = (requestIdRef.current += 1);
    const key = itemsKey;

    fetch("/api/cart/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          colorValueId: i.colorValueId,
          qty: i.quantity,
        })),
      }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("resolve failed"))))
      .then((data: { items: ResolvedCartItem[] }) => {
        if (requestIdRef.current !== requestId) return;
        setFetchedItems(data.items);
        setFetchedKey(key);
      })
      .catch(() => {
        if (requestIdRef.current !== requestId) return;
        /* Запрос не удался — снимаем "resolving", чтобы не крутить спиннер
         * вечно; честная обработка ошибки резолва — вне скоупа этого уровня. */
        setFetchedKey(key);
      });
  }, [items, itemsKey]);

  /* Производные значения, а не setState в эффекте: пустая корзина сразу
   * отражается в резолве без ожидания сети, а "isResolving" — просто сверка
   * "для какого набора items уже есть ответ сервера". */
  const resolvedItems = useMemo(
    () => (items.length === 0 ? [] : fetchedItems),
    [items.length, fetchedItems]
  );
  const isResolving = items.length > 0 && fetchedKey !== itemsKey;

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => resolvedItems.reduce((sum, i) => sum + i.priceByn * i.quantity, 0),
    [resolvedItems]
  );

  const value: CartContextValue = {
    items,
    resolvedItems,
    isResolving,
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
