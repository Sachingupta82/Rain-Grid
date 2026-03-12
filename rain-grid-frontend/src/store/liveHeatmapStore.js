import { create } from "zustand"
import { api } from "../api/api"

export const useLiveHeatmapStore = create((set) => ({
  heatmap: null,
  loading: false,

  runHeatmap: async ({ rainfall_mm, drain_blockage }) => {
    set({ loading: true })
    try {
      const res = await api.post("/heatmap/live-risk-heatmap", {
        rainfall_mm,
        drain_blockage
      })
      set({ heatmap: res.data.heatmap || [], loading: false })
    } catch {
      set({ loading: false })
    }
  },

  clearHeatmap: () => set({ heatmap: null })
}))