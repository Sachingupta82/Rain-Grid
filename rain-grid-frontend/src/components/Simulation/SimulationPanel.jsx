import { useState } from "react"
import { api } from "../../api/api"
import { useSimulationStore } from "../../store/simulationStore"

export default function SimulationPanel() {

  const [rainfall, setRainfall] = useState(120)
  const [blockage, setBlockage] = useState(0.3)
  const [pumps, setPumps] = useState(5)
  const [capacity, setCapacity] = useState(120)
  const [loading, setLoading] = useState(false)

  const setSimulationResult = useSimulationStore(
  state => state.setSimulationResult
)

  const runSimulation = async () => {

    setLoading(true)

    const res = await api.post(
      "/simulation/simulate-flood",
      {
        rainfall_mm: rainfall,
        pumps_allocated: pumps,
        pump_capacity_lps: capacity,
        drain_blockage_factor: blockage
      }
    )

    setSimulationResult(res.data)

    console.log("Simulation result:", res.data)

    setLoading(false)

  }

  return (

    <div className="backdrop-blur-md bg-white/40 border border-white/30 shadow-xl rounded-xl p-6">

      <h2 className="text-lg font-semibold mb-6 text-gray-700">

        Flood Simulation

      </h2>

      {/* Rainfall */}

      <div className="mb-6">

        <div className="flex justify-between text-sm text-gray-600 mb-2">

          <span>Rainfall Intensity</span>
          <span>{rainfall} mm</span>

        </div>

        <input
          type="range"
          min="0"
          max="300"
          value={rainfall}
          onChange={(e)=>setRainfall(Number(e.target.value))}
          className="w-full accent-blue-600"
        />

      </div>

      {/* Drain Blockage */}

      <div className="mb-6">

        <div className="flex justify-between text-sm text-gray-600 mb-2">

          <span>Drain Blockage</span>
          <span>{Math.round(blockage*100)}%</span>

        </div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={blockage}
          onChange={(e)=>setBlockage(Number(e.target.value))}
          className="w-full accent-red-500"
        />

      </div>

      {/* Pumps */}

      <div className="mb-4">

        <label className="text-sm text-gray-600">

          Pumps Allocated

        </label>

        <input
          type="number"
          value={pumps}
          onChange={(e)=>setPumps(Number(e.target.value))}
          className="mt-1 w-full border rounded-lg p-2"
        />

      </div>

      {/* Pump Capacity */}

      <div className="mb-6">

        <label className="text-sm text-gray-600">

          Pump Capacity (LPS)

        </label>

        <input
          type="number"
          value={capacity}
          onChange={(e)=>setCapacity(Number(e.target.value))}
          className="mt-1 w-full border rounded-lg p-2"
        />

      </div>

      {/* Run Simulation */}

      <button
        onClick={runSimulation}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
      >

        {loading ? "Running..." : "Run Simulation"}

      </button>

    </div>

  )

}