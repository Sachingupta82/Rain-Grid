import { create } from "zustand"

export const useMapViewStore = create((set) => ({
  viewMode: "risk",
  filters: {
    showHigh: false,
    showMedium: false,
    showLowElevation: false
  },
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleFilter: (key) =>
    set((state) => ({
      filters: { ...state.filters, [key]: !state.filters[key] }
    })),
  clearFilters: () =>
    set({ filters: { showHigh: false, showMedium: false, showLowElevation: false } })
}))