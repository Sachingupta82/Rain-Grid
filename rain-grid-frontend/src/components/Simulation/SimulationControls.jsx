import { useState } from "react"
import { api } from "../../api/api"
import { Play } from "lucide-react"

export default function SimulationControls() {
  const [rainfall, setRainfall] = useState(120)
  const [pumps, setPumps] = useState(5)
  const [capacity, setCapacity] = useState(120)
  const [blockage, setBlockage] = useState(0.3)

  const runSimulation = async () => {
    const res = await api.post("/simulation/simulate-flood", {
      rainfall_mm: rainfall,
      pumps_allocated: pumps,
      pump_capacity_lps: capacity,
      drain_blockage_factor: blockage
    })
    console.log("Simulation Result", res.data)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 font-sans">

      <h2 className="text-base font-bold text-slate-900 tracking-tight mb-5">
        Rainfall Simulation
      </h2>

      {/* Rainfall slider */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Rainfall</label>
          <span className="text-xs font-bold font-mono text-blue-600">{rainfall} mm</span>
        </div>
        <div className="relative h-1.5 rounded-full bg-slate-100">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-blue-600 transition-all duration-100"
            style={{ width: `${(rainfall / 300) * 100}%` }}
          />
          <input
            type="range" min="0" max="300" value={rainfall}
            onChange={e => setRainfall(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Blockage slider */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Drain Blockage</label>
          <span className="text-xs font-bold font-mono text-red-600">{(blockage * 100).toFixed(0)}%</span>
        </div>
        <div className="relative h-1.5 rounded-full bg-slate-100">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-red-500 transition-all duration-100"
            style={{ width: `${blockage * 100}%` }}
          />
          <input
            type="range" min="0" max="1" step="0.1" value={blockage}
            onChange={e => setBlockage(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Pumps */}
      <div className="mb-4">
        <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 block mb-1.5">
          Allocated Pumps
        </label>
        <input
          type="number"
          value={pumps}
          onChange={e => setPumps(e.target.value)}
          className="w-full rounded-xl px-3 py-2 text-sm outline-none border border-slate-200 bg-slate-50 text-slate-900 font-mono focus:border-blue-500 focus:bg-white transition-colors"
        />
      </div>

      {/* Pump Capacity */}
      <div className="mb-5">
        <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 block mb-1.5">
          Pump Capacity (LPS)
        </label>
        <input
          type="number"
          value={capacity}
          onChange={e => setCapacity(e.target.value)}
          className="w-full rounded-xl px-3 py-2 text-sm outline-none border border-slate-200 bg-slate-50 text-slate-900 font-mono focus:border-blue-500 focus:bg-white transition-colors"
        />
      </div>

      <button
        onClick={runSimulation}
        className="w-full py-2.5 rounded-full bg-slate-900 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors shadow-sm"
      >
        <Play size={13} className="fill-white" /> Run Simulation
      </button>
    </div>
  )
}