"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useCatalog } from "./CatalogProvider";
import type { CartItem, Colorway, Product } from "@/lib/types";

export interface CartLine {
  key: string;
  product: Product;
  colorway: Colorway;
  size: string | undefined;
  qty: number;
}

interface CartCtx {
  lines: CartLine[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (slug: string, colorwayId?: string, qty?: number, size?: string) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
}

const Ctx = createContext<CartCtx | null>(null);
const STORAGE_KEY = "zalores-cart-v1";

const keyOf = (slug: string, colorway?: string, size?: string) =>
  `${slug}:${colorway ?? "default"}:${size ?? ""}`;

export function CartProvider({ children }: { children: ReactNode }) {
  const { getProduct } = useCatalog();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = (JSON.parse(raw) as CartItem[]).filter((i) =>
          getProduct(i.slug)
        );
        setItems(parsed);
      }
    } catch {
      /* corrupted storage, start empty */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add = useCallback((slug: string, colorwayId?: string, qty = 1, size?: string) => {
    const key = keyOf(slug, colorwayId, size);
    setItems((prev) => {
      const existing = prev.find((i) => keyOf(i.slug, i.colorway, i.size) === key);
      if (existing)
        return prev.map((i) =>
          keyOf(i.slug, i.colorway, i.size) === key
            ? { ...i, qty: Math.min(i.qty + qty, 10) }
            : i
        );
      return [...prev, { slug, colorway: colorwayId, qty, size }];
    });
    setIsOpen(true);
  }, []);

  const remove = useCallback((key: string) => {
    setItems((prev) =>
      prev.filter((i) => keyOf(i.slug, i.colorway, i.size) !== key)
    );
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => keyOf(i.slug, i.colorway, i.size) !== key)
        : prev.map((i) =>
            keyOf(i.slug, i.colorway, i.size) === key ? { ...i, qty } : i
          )
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartCtx>(() => {
    const lines = items
      .map((i) => {
        const product = getProduct(i.slug);
        if (!product) return null;
        const colorway =
          product.colorways.find((c) => c.id === i.colorway) ??
          product.colorways[0];
        return {
          key: keyOf(i.slug, i.colorway, i.size),
          product,
          colorway,
          size: i.size,
          qty: i.qty,
        };
      })
      .filter((l): l is CartLine => Boolean(l));
    return {
      lines,
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal: lines.reduce((n, l) => n + l.product.price * l.qty, 0),
      isOpen,
      openCart,
      closeCart,
      add,
      remove,
      setQty,
      clear,
    };
  }, [items, isOpen, openCart, closeCart, add, remove, setQty, clear]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
