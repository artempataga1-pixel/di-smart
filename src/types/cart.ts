export type Availability = "IN_STOCK" | "OUT_OF_STOCK";

/** Составной ключ строки корзины — один и тот же товар в разных
 * вариантах/цветах должен быть разными строками. */
export interface CartItemKey {
  productId: string;
  variantId: string | null;
  colorValueId: string | null;
}

export interface CartItem extends CartItemKey {
  quantity: number;
}

export interface AddCartItemInput {
  productId: string;
  variantId?: string | null;
  colorValueId?: string | null;
  qty?: number;
}

/** Данные строки корзины, актуальные на текущий момент (цена по текущему
 * курсу, наличие) — приходят из `POST /api/cart/resolve`, не хранятся
 * локально: цена/наличие товара могут поменяться, пока лежит в корзине. */
export interface ResolvedCartItem extends CartItemKey {
  quantity: number;
  slug: string;
  name: string;
  variantLabel: string | null;
  colorName: string | null;
  priceByn: number;
  imageUrl: string | null;
  availability: Availability;
}

export interface CartContextValue {
  items: CartItem[];
  resolvedItems: ResolvedCartItem[];
  isResolving: boolean;
  itemCount: number;
  subtotal: number;
  isDrawerOpen: boolean;
  addItem: (input: AddCartItemInput) => void;
  removeItem: (key: CartItemKey) => void;
  setQuantity: (key: CartItemKey, qty: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}
