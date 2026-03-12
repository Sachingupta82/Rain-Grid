import { useState } from "react"
import { api } from "../../api/api"
import { useSimulationStore } from "../../store/simulationStore"
import { useLiveHeatmapStore } from "../../store/liveHeatmapStore"
import { ChevronDown, Play, X } from "lucide-react"

function SliderField({ label, value, min, max, step = 1, onChange, unit = "", color = "#2563eb" }) {
  const pct = ((value - min) / (max - min)) * 100
  const displayValue = label.includes("Blockage")
    ? `${Math.round(value * 100)}%`
    : `${value}${unit}`

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{label}</span>
        <span className="text-xs font-bold font-mono" style={{ color }}>{displayValue}</span>
      </div>
      <div className="relative h-1.5 rounded-full bg-slate-100">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-100"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  )
}

/* ---------------- FIXED NUMBER FIELD ---------------- */

function NumberField({ label, value, onChange, unit = "" }) {

  const handleChange = (e) => {
    const val = e.target.value

    // allow empty
    if (val === "") {
      onChange("")
      return
    }

    // allow only numbers
    if (/^\d+$/.test(val)) {
      onChange(Number(val))
    }
  }

  return (
    <div className="mb-4">

      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          {label}
        </span>

        <span className="text-[10px] text-slate-400">
          {unit}
        </span>
      </div>

      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        placeholder="Enter value"
        className="w-full rounded-xl px-3 py-2 text-sm outline-none border border-slate-200 bg-slate-50 text-slate-900 font-mono focus:border-blue-500 focus:bg-white transition-colors"
      />

    </div>
  )
}

/* ---------------- STAT CARD ---------------- */

function StatCard({ label, value, sub, color, delay = 0 }) {
  const bgMap = {
    "#f87171": "bg-red-50 border-red-200",
    "#fbbf24": "bg-amber-50 border-amber-200",
    "#34d399": "bg-emerald-50 border-emerald-200",
  }

  const cardClass = bgMap[color] || "bg-slate-50 border-slate-200"

  return (
    <div
      className={`rounded-xl p-3 border ${cardClass}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
        {label}
      </div>

      <div className="text-2xl font-bold tracking-tighter leading-none" style={{ color }}>
        {value}
      </div>

      {sub && (
        <div className="text-[10px] mt-1 font-medium" style={{ color }}>
          {sub}
        </div>
      )}
    </div>
  )
}

/* ---------------- MAIN PANEL ---------------- */

export default function SimulationPanel() {

  const [rainfall, setRainfall] = useState(120)
  const [blockage, setBlockage] = useState(0.3)
  const [pumps, setPumps] = useState(5)
  const [capacity, setCapacity] = useState(120)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(true)

  const { simulationResult, setSimulationResult, clearSimulation } =
    useSimulationStore()

  const runHeatmap = useLiveHeatmapStore(s => s.runHeatmap)

  const runSimulation = async () => {

    setLoading(true)
    clearSimulation()

    try {

      const body = {
        rainfall_mm: rainfall,
        pumps_allocated: pumps || 0,
        pump_capacity_lps: capacity || 0,
        drain_blockage_factor: blockage
      }

      const res = await api.post("/simulation/simulate-flood", body)

      setSimulationResult(res.data)

      runHeatmap({
        rainfall_mm: rainfall,
        drain_blockage: blockage
      })

    } catch (err) {

      console.error("Simulation error:", err)

    } finally {

      setLoading(false)

    }

  }

  return (

    <div className="rounded-2xl overflow-hidden bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl"
         style={{ minWidth: 280, maxWidth: 320 }}>

      {/* HEADER */}

      <div
        className={`flex items-center justify-between px-4 py-3 cursor-pointer select-none ${
          expanded ? "border-b border-slate-100" : ""
        }`}
        onClick={() => setExpanded(!expanded)}
      >

        <div className="flex items-center gap-2">

          <div className="relative">

            <div className={`w-2 h-2 rounded-full ${
              loading
                ? "bg-amber-400"
                : simulationResult
                ? "bg-emerald-500"
                : "bg-blue-600"
            }`} />

            {loading && (
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-amber-400 animate-ping opacity-60" />
            )}

          </div>

          <span className="text-sm font-bold text-slate-900 tracking-tight">
            Flood Simulation
          </span>

        </div>

        <ChevronDown
          size={15}
          className="text-slate-400 transition-transform duration-300"
          style={{ transform: expanded ? "rotate(0deg)" : "rotate(180deg)" }}
        />

      </div>

      {/* BODY */}

      <div
        style={{
          maxHeight: expanded ? 600 : 0,
          overflow: "hidden",
          transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)"
        }}
      >

        <div className="px-4 pb-4 pt-3">

          <SliderField
            label="Rainfall Intensity"
            value={rainfall}
            min={0}
            max={300}
            onChange={setRainfall}
            unit=" mm"
            color="#2563eb"
          />

          <SliderField
            label="Drain Blockage"
            value={blockage}
            min={0}
            max={1}
            step={0.05}
            onChange={setBlockage}
            color="#dc2626"
          />

          <NumberField
            label="Pumps Allocated"
            value={pumps}
            onChange={setPumps}
            unit="units"
          />

          <NumberField
            label="Pump Capacity"
            value={capacity}
            onChange={setCapacity}
            unit="LPS"
          />

          {/* RUN BUTTON */}

          <button
            onClick={runSimulation}
            disabled={loading}
            className={`w-full py-2.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all mt-1 ${
              loading
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-slate-900 text-white hover:bg-blue-600 shadow-sm"
            }`}
          >

            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-slate-500 animate-spin" />
                Simulating...
              </>
            ) : (
              <>
                <Play size={13} className="fill-white" />
                Run Simulation
              </>
            )}

          </button>

          {simulationResult && (

            <button
              onClick={clearSimulation}
              className="w-full mt-2 py-1.5 rounded-full text-xs font-medium text-slate-400 bg-slate-50 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors flex items-center justify-center gap-1.5"
            >

              <X size={11} />
              Clear Results

            </button>

          )}

        </div>

        {/* RESULTS */}

        {simulationResult && !loading && (

          <div className="px-4 pb-4">

            <div className="h-px mb-4 bg-slate-100" />

            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
              Simulation Results
            </p>

            <div className="grid grid-cols-2 gap-2">

              <StatCard
                label="Affected Grids"
                value={simulationResult.affected_grids ?? "—"}
                color="#f87171"
              />

              <StatCard
                label="Critical Wards"
                value={simulationResult.critical_wards ?? "—"}
                color="#fbbf24"
              />

              <StatCard
                label="Rec. Pumps"
                value={simulationResult.recommended_pumps ?? "—"}
                color="#34d399"
              />

              <StatCard
                label="Pump Deficit"
                value={simulationResult.pump_deficit ?? "—"}
                sub={simulationResult.pump_deficit > 0 ? "critical shortage" : "covered"}
                color={simulationResult.pump_deficit > 0 ? "#f87171" : "#34d399"}
              />

            </div>

          </div>

        )}

      </div>

    </div>

  )

}