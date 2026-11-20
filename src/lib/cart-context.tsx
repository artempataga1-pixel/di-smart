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

import { MAX_CART_ITEMS, MAX_ITEM_QTY, isRawCartItem } from "@/lib/cart-validation";

const STORAGE_KEY = "di-smart-cart-v1";

/* Источник правды — localStorage вне React, компоненты подписаны через
 * useSyncExternalStore (тот же паттерн, что useIsTouch.ts). Это избегает
 * setState-в-эффекте на маунте и связанного с ним hydration-мисматча:
 * getServerSnapshot стабильно отдаёт [] на сервере, а после гидратации
 * React сам ресинхронизирует со снапшотом клиента. */
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined = undefined;
let cachedItems: CartItem[] = [];
let memoryOnly = false;

function readCart(): CartItem[] {
  if (memoryOnly) return cachedItems;
  let raw: string | null;
  try { raw = window.localStorage.getItem(STORAGE_KEY); } catch { return cachedItems; }
  if (raw === cachedRaw) return cachedItems;
  cachedRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cachedItems = Array.isArray(parsed) ? parsed.filter((item): item is CartItem =>
      item && isRawCartItem({ ...item, qty: item.quantity })).slice(0, MAX_CART_ITEMS) : [];
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
    // Не перечитываем старое значение после неудачной записи.
    memoryOnly = true;
  }
  listeners.forEach((l) => l());
}

function subscribeCart(callback: () => void) {
  listeners.add(callback);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) { cachedRaw = undefined; cachedItems = []; callback(); }
  };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(callback); window.removeEventListener("storage", onStorage); };
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
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const refreshCart = useCallback(() => { setFetchedKey(null); setResolveError(null); setRefreshVersion(v => v + 1); }, []);

  const itemsKey = useMemo(() => JSON.stringify(items), [items]);

  const addItem = useCallback((input: AddCartItemInput) => {
    const key: CartItemKey = {
      productId: input.productId,
      variantId: input.variantId ?? null,
      colorValueId: input.colorValueId ?? null,
    };
    const qty = Math.max(1, Math.min(MAX_ITEM_QTY, Math.trunc(input.qty ?? 1)));
    const current = readCart();
    const existing = current.find((i) => sameKey(i, key));
    if (!Number.isFinite(qty) || (!existing && current.length >= MAX_CART_ITEMS)) return;
    const next = existing
      ? current.map((i) => (sameKey(i, key) ? { ...i, quantity: Math.min(MAX_ITEM_QTY, i.quantity + qty) } : i))
      : [...current, { ...key, quantity: qty }];
    writeCart(next);
    setDrawerOpen(true);
  }, []);

  const removeItem = useCallback((key: CartItemKey) => {
    writeCart(readCart().filter((i) => !sameKey(i, key)));
  }, []);

  const setQuantity = useCallback((key: CartItemKey, qty: number) => {
    if (!Number.isFinite(qty)) return;
    qty = Math.min(MAX_ITEM_QTY, Math.trunc(qty));
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

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    // Объединяем быстрые клики количества в один запрос.
    const debounce = setTimeout(() => { void fetch("/api/cart/resolve", {
      signal: controller.signal,
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
        if (!Array.isArray(data.items)) throw new Error("invalid response");
        setResolveError(null);
        setFetchedItems(data.items);
        setFetchedKey(key);
      })
      .catch(() => {
        if (requestIdRef.current !== requestId) return;
        setResolveError("Не удалось обновить корзину. Проверьте соединение и повторите попытку.");
        setFetchedKey(key);
      }).finally(() => clearTimeout(timeout)); }, 150);
    return () => { requestIdRef.current += 1; clearTimeout(debounce); clearTimeout(timeout); controller.abort(); };
  }, [items, itemsKey, refreshVersion]);

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
    resolveError: items.length ? resolveError : null,
    refreshCart,
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
