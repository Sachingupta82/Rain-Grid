import { create } from "zustand"
import { api } from "../api/api"

export const useGridInsightsStore = create((set) => ({
  selectedGridId: null,
  insights: null,
  loading: false,
  error: null,

  selectGrid: async (gridId) => {
    set({ selectedGridId: gridId, loading: true, error: null, insights: null })
    try {
      const res = await api.get(`/map/grids/${gridId}/insights`)
      set({ insights: res.data, loading: false })
    } catch (err) {
      set({
        error: err?.response?.data?.message || err.message || "Failed to load grid insights",
        loading: false
      })
    }
  },

  clearSelection: () =>
    set({ selectedGridId: null, insights: null, loading: false, error: null })
}))