import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { toCatalogProduct, type CatalogProduct } from './lib/api';
import { usePersistentState } from './lib/hooks';
import { FREE_SHIPPING_MIN, SHIPPING_FEE, toBRL } from './lib/utils';

export interface CartItem {
  product: CatalogProduct;
  qty: number;
}

export interface Address {
  name: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
}

export type PaymentMethod = 'pix' | 'boleto' | 'cartao';

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number; // R$
  shipping: number; // R$
  address: Address;
  payment: PaymentMethod;
}

export interface User {
  name: string;
  email: string;
}

interface Toast {
  product: CatalogProduct;
  qty: number;
  key: number;
}

interface Store {
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number; // R$
  shippingFee: number; // R$
  addToCart: (product: CatalogProduct, qty?: number) => void;
  updateQty: (id: number, qty: number) => void;
  removeFromCart: (id: number) => void;
  orders: Order[];
  placeOrder: (address: Address, payment: PaymentMethod) => Order;
  user: User | null;
  signIn: (user: User) => void;
  signOut: () => void;
  recentlyViewed: CatalogProduct[];
  addRecentlyViewed: (product: CatalogProduct) => void;
  toast: Toast | null;
  dismissToast: () => void;
}

const StoreContext = createContext<Store | null>(null);

const MAX_QTY = 30;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = usePersistentState<CartItem[]>('amz:cart', []);
  const [orders, setOrders] = usePersistentState<Order[]>('amz:orders', []);
  const [user, setUser] = usePersistentState<User | null>('amz:user', null);
  const [recentlyViewed, setRecentlyViewed] = usePersistentState<CatalogProduct[]>('amz:recent', []);
  const [toast, setToast] = useState<Toast | null>(null);

  const addToCart = useCallback(
    (product: CatalogProduct, qty = 1) => {
      const item = toCatalogProduct(product);
      const limit = Math.min(item.stock, MAX_QTY);
      setCart((current) => {
        const existing = current.find((i) => i.product.id === item.id);
        if (existing) {
          return current.map((i) =>
            i.product.id === item.id ? { ...i, qty: Math.min(i.qty + qty, limit) } : i,
          );
        }
        return [...current, { product: item, qty: Math.min(qty, limit) }];
      });
      setToast({ product: item, qty, key: Date.now() });
    },
    [setCart],
  );

  const updateQty = useCallback(
    (id: number, qty: number) =>
      setCart((current) =>
        qty <= 0
          ? current.filter((i) => i.product.id !== id)
          : current.map((i) =>
              i.product.id === id ? { ...i, qty: Math.min(qty, i.product.stock, MAX_QTY) } : i,
            ),
      ),
    [setCart],
  );

  const removeFromCart = useCallback(
    (id: number) => setCart((current) => current.filter((i) => i.product.id !== id)),
    [setCart],
  );

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const cartSubtotal = cart.reduce((sum, i) => sum + toBRL(i.product.price) * i.qty, 0);
  const shippingFee = cartSubtotal >= FREE_SHIPPING_MIN || cart.length === 0 ? 0 : SHIPPING_FEE;

  const placeOrder = useCallback(
    (address: Address, payment: PaymentMethod) => {
      const order: Order = {
        id: `702-${Math.floor(1e6 + Math.random() * 9e6)}-${Math.floor(1e6 + Math.random() * 9e6)}`,
        date: new Date().toISOString(),
        items: cart,
        subtotal: cartSubtotal,
        shipping: shippingFee,
        address,
        payment,
      };
      setOrders((current) => [order, ...current]);
      setCart([]);
      return order;
    },
    [cart, cartSubtotal, shippingFee, setCart, setOrders],
  );

  const addRecentlyViewed = useCallback(
    (product: CatalogProduct) =>
      setRecentlyViewed((current) =>
        [toCatalogProduct(product), ...current.filter((p) => p.id !== product.id)].slice(0, 12),
      ),
    [setRecentlyViewed],
  );

  const signOut = useCallback(() => setUser(null), [setUser]);
  const dismissToast = useCallback(() => setToast(null), []);

  const value = useMemo<Store>(
    () => ({
      cart,
      cartCount,
      cartSubtotal,
      shippingFee,
      addToCart,
      updateQty,
      removeFromCart,
      orders,
      placeOrder,
      user,
      signIn: setUser,
      signOut,
      recentlyViewed,
      addRecentlyViewed,
      toast,
      dismissToast,
    }),
    [cart, cartCount, cartSubtotal, shippingFee, addToCart, updateQty, removeFromCart, orders, placeOrder, user, setUser, signOut, recentlyViewed, addRecentlyViewed, toast, dismissToast],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore precisa estar dentro de <StoreProvider>');
  return store;
}
