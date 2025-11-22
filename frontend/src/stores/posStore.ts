import { create } from 'zustand';
import { OrderLine } from '@/types';

interface POSState {
  saleMode: 'gros' | 'detail';
  lines: OrderLine[];
  remise: number;
  setSaleMode: (mode: 'gros' | 'detail') => void;
  addLine: (line: OrderLine) => void;
  removeLine: (index: number) => void;
  updateLineQty: (index: number, qty: number) => void;
  setRemise: (remise: number) => void;
  clearSale: () => void;
  getSubtotal: () => number;
  getTax: (taxRate: number) => number;
  getTotal: (taxRate: number) => number;
}

export const usePOSStore = create<POSState>((set, get) => ({
  saleMode: 'detail',
  lines: [],
  remise: 0,

  setSaleMode: (mode) => set({ saleMode: mode }),

  addLine: (line) => {
    set((state) => ({ lines: [...state.lines, line] }));
  },

  removeLine: (index) => {
    set((state) => ({
      lines: state.lines.filter((_, i) => i !== index),
    }));
  },

  updateLineQty: (index, qty) => {
    set((state) => ({
      lines: state.lines.map((line, i) => {
        if (i === index) {
          return {
            ...line,
            qty,
            lineTotal: line.unitPrice * qty,
          };
        }
        return line;
      }),
    }));
  },

  setRemise: (remise) => set({ remise }),

  clearSale: () => set({ lines: [], remise: 0 }),

  getSubtotal: () => {
    return get().lines.reduce((sum, line) => sum + line.lineTotal, 0);
  },

  getTax: (taxRate) => {
    const subtotal = get().getSubtotal();
    const afterRemise = Math.max(0, subtotal - get().remise);
    return afterRemise * taxRate;
  },

  getTotal: (taxRate) => {
    const subtotal = get().getSubtotal();
    const afterRemise = Math.max(0, subtotal - get().remise);
    const tax = get().getTax(taxRate);
    return afterRemise + tax;
  },
}));
