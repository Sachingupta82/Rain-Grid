import { useState } from "react"
import { api } from "../../api/api"

export default function SimulationControls() {

  const [rainfall, setRainfall] = useState(120)
  const [pumps, setPumps] = useState(5)
  const [capacity, setCapacity] = useState(120)
  const [blockage, setBlockage] = useState(0.3)

  const runSimulation = async () => {

    const res = await api.post(
      "/simulation/simulate-flood",
      {
        rainfall_mm: rainfall,
        pumps_allocated: pumps,
        pump_capacity_lps: capacity,
        drain_blockage_factor: blockage
      }
    )

    console.log("Simulation Result", res.data)

  }

  return (

    <div>

      <h2 className="text-xl font-semibold mb-6">

        Rainfall Simulation

      </h2>

      {/* Rainfall */}

      <label className="text-sm">Rainfall (mm)</label>

      <input
        type="range"
        min="0"
        max="300"
        value={rainfall}
        onChange={e => setRainfall(e.target.value)}
        className="w-full mb-4"
      />

      <div className="text-sm mb-4">{rainfall} mm</div>

      {/* Pumps */}

      <label className="text-sm">Allocated Pumps</label>

      <input
        type="number"
        value={pumps}
        onChange={e => setPumps(e.target.value)}
        className="border w-full p-2 mb-4"
      />

      {/* Pump Capacity */}

      <label className="text-sm">Pump Capacity (LPS)</label>

      <input
        type="number"
        value={capacity}
        onChange={e => setCapacity(e.target.value)}
        className="border w-full p-2 mb-4"
      />

      {/* Blockage */}

      <label className="text-sm">Drain Blockage</label>

      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={blockage}
        onChange={e => setBlockage(e.target.value)}
        className="w-full mb-4"
      />

      <div className="text-sm mb-6">

        {(blockage * 100).toFixed(0)} %

      </div>

      <button
        onClick={runSimulation}
        className="bg-blue-600 text-white w-full py-2 rounded"
      >

        Run Simulation

      </button>

    </div>

  )

}