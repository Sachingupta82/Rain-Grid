import { create } from "zustand"

export const useSimulationStore = create((set) => ({
  simulationResult: null,
  isRunning: false,
  setSimulationResult: (result) => set({ simulationResult: result, isRunning: false }),
  setRunning: (val) => set({ isRunning: val }),
  clearSimulation: () => set({ simulationResult: null, isRunning: false })
}))