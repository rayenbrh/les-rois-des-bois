import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, ProductVariant, SubProduct } from '@/types';

interface CartState {
  items: CartItem[];
  addItem: (
    product: Product,
    qty: number,
    variant?: ProductVariant,
    componentSelections?: Record<string, SubProduct>
  ) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, qty: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, qty, variant, componentSelections) => {
        // Calculate unit price
        let unitPrice = product.price.retail;

        // Add component extra prices if special product
        if (componentSelections) {
          Object.values(componentSelections).forEach((subProduct) => {
            unitPrice += subProduct.extraPrice;
          });
        }

        const item: CartItem = {
          product,
          variant,
          componentSelections,
          qty,
          unitPrice,
          total: unitPrice * qty,
        };

        set((state) => ({ items: [...state.items, item] }));
      },

      removeItem: (index) => {
        set((state) => ({
          items: state.items.filter((_, i) => i !== index),
        }));
      },

      updateQuantity: (index, qty) => {
        set((state) => ({
          items: state.items.map((item, i) => {
            if (i === index) {
              return {
                ...item,
                qty,
                total: item.unitPrice * qty,
              };
            }
            return item;
          }),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.total, 0);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.qty, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
