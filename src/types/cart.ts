import type { Product } from "./legacy-product";

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface ResolvedCartItem {
  product: Product;
  quantity: number;
}

export interface CartContextValue {
  items: CartItem[];
  resolvedItems: ResolvedCartItem[];
  itemCount: number;
  subtotal: number;
  isDrawerOpen: boolean;
  addItem: (productId: string, qty?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}
