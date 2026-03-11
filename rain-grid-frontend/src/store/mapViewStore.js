import { create } from "zustand"

export const useMapViewStore = create((set) => ({

  viewMode: "risk",

  setViewMode: (mode) => set({ viewMode: mode }),

  filters: {
    showHigh: false,
    showMedium: false,
    showLowElevation: false
  },

  toggleFilter: (key) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: !state.filters[key]
      }
    }))

}))