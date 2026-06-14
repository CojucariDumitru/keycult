import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../types';

interface WishlistState {
  items: Product[];
  toggle: (product: Product) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
  count: () => number;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (product) =>
        set((state) =>
          state.items.some((i) => i.id === product.id)
            ? { items: state.items.filter((i) => i.id !== product.id) }
            : { items: [...state.items, product] }
        ),
      remove: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      has: (id) => get().items.some((i) => i.id === id),
      count: () => get().items.length,
    }),
    { name: 'keycult_wishlist' }
  )
);
