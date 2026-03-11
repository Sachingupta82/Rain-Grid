import { create } from "zustand"

export const useSimulationStore = create((set)=>({

  simulationResult: null,

  setSimulationResult: (data)=>set({
    simulationResult: data
  })

}))