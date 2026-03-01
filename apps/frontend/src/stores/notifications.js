import { create } from "zustand";

/**
 * In-app notifications (e.g. "New comment on Paris trip").
 * Can be extended later with push/backend.
 */
export const useNotificationStore = create((set) => ({
  items: [],
  add: (payload) =>
    set((state) => ({
      items: [
        { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, read: false, ...payload },
        ...state.items,
      ].slice(0, 50),
    })),
  markRead: (id) =>
    set((state) => ({
      items: state.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  markAllRead: () =>
    set((state) => ({
      items: state.items.map((n) => ({ ...n, read: true })),
    })),
  clear: () => set({ items: [] }),
}));
