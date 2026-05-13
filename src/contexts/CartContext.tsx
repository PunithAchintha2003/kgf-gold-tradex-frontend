import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = 'kgf_cart_v1';

export interface CartLineItem {
  id: string;
  name: string;
  priceLkr: number;
  image: string;
  seller: string;
  purity: string;
  weight: string;
  quantity: number;
}

function loadCartFromStorage(): CartLineItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is CartLineItem =>
        row &&
        typeof row === 'object' &&
        typeof (row as CartLineItem).id === 'string' &&
        typeof (row as CartLineItem).name === 'string' &&
        typeof (row as CartLineItem).priceLkr === 'number' &&
        typeof (row as CartLineItem).quantity === 'number',
    );
  } catch {
    return [];
  }
}

interface CartContextValue {
  items: CartLineItem[];
  itemCount: number;
  subtotalLkr: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartLineItem, 'quantity'> & { quantity?: number }) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartLineItem[]>(loadCartFromStorage);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore quota */
    }
  }, [items]);

  const itemCount = useMemo(
    () => items.reduce((sum, row) => sum + row.quantity, 0),
    [items],
  );

  const subtotalLkr = useMemo(
    () => items.reduce((sum, row) => sum + row.priceLkr * row.quantity, 0),
    [items],
  );

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((o) => !o), []);

  const addItem = useCallback(
    (item: Omit<CartLineItem, 'quantity'> & { quantity?: number }) => {
      const q = item.quantity && item.quantity > 0 ? Math.floor(item.quantity) : 1;
      setItems((prev) => {
        const idx = prev.findIndex((p) => p.id === item.id);
        if (idx >= 0) {
          return prev.map((p, i) =>
            i === idx ? { ...p, quantity: p.quantity + q } : p,
          );
        }
        const line: CartLineItem = {
          id: item.id,
          name: item.name,
          priceLkr: item.priceLkr,
          image: item.image,
          seller: item.seller,
          purity: item.purity,
          weight: item.weight,
          quantity: q,
        };
        return [...prev, line];
      });
    },
    [],
  );

  const setQuantity = useCallback((productId: string, quantity: number) => {
    const nextQty = Math.max(0, Math.floor(quantity));
    setItems((prev) => {
      if (nextQty <= 0) {
        return prev.filter((p) => p.id !== productId);
      }
      return prev.map((p) =>
        p.id === productId ? { ...p, quantity: nextQty } : p,
      );
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotalLkr,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
    }),
    [
      items,
      itemCount,
      subtotalLkr,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}
