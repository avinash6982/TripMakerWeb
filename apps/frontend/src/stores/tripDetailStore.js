import { create } from "zustand";

/**
 * Trip Detail page state: avoids prop-drilling for trip data and shared UI state
 * (map day filter, panels) across the large TripDetail tree.
 */
export const useTripDetailStore = create((set) => ({
  trip: null,
  setTrip: (tripOrUpdater) =>
    set((state) => ({
      trip: typeof tripOrUpdater === "function" ? tripOrUpdater(state.trip) : tripOrUpdater,
    })),

  /** When set, map shows only this day; null = all days. */
  activeMapDay: null,
  setActiveMapDay: (day) => set({ activeMapDay: day }),

  /** Reset when navigating away from trip detail (call from TripDetail on unmount or id change). */
  reset: () => set({ trip: null, activeMapDay: null }),
}));
