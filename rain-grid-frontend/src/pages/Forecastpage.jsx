import { useState } from "react"
import { api } from "../api/api"

// POST /forecast/flood-forecast
// Body: { rainfall_mm, drain_blockage_factor, pumps_deployed, pump_capacity_lps }
// Returns: { flood_grids, high_risk_wards, recommended_pumps, example_grids }

function SliderField({ label, value, min, max, step = 1, onChange, unit = "", color = "var(--accent)" }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-2">
        <span style={{ fontSize: 12, color: "var(--text-2)", fontFamily: "Instrument Sans, sans-serif" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "Fira Code, monospace" }}>
          {unit === "%" ? `${Math.round(value * 100)}%` : `${value}${unit}`}
        </span>
      </div>
      <div className="relative h-1.5 rounded-full" style={{ background: "var(--border)" }}>
        <div className="absolute h-full rounded-full left-0 top-0" style={{ width: `${pct}%`, background: color }} />
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
      </div>
    </div>
  )
}

function NumberField({ label, value, onChange, unit }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span style={{ fontSize: 12, color: "var(--text-2)", fontFamily: "Instrument Sans, sans-serif" }}>{label}</span>
        <span style={{ fontSize: 10, color: "var(--text-3)" }}>{unit}</span>
      </div>
      <input type="number" value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-full rounded-xl px-3 py-2 text-sm outline-none transition"
        style={{ background: "var(--surface-2)", color: "var(--text-1)", border: "1px solid var(--border)", fontFamily: "Fira Code, monospace" }}
        onFocus={e => { e.target.style.borderColor = "var(--accent)" }}
        onBlur={e => { e.target.style.borderColor = "var(--border)" }}
      />
    </div>
  )
}

function ScenarioPreset({ label, desc, values, onApply }) {
  return (
    <button
      onClick={() => onApply(values)}
      className="text-left p-3 rounded-xl transition-all duration-150 w-full"
      style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "var(--accent-light)" }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface-2)" }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", fontFamily: "Bricolage Grotesque, sans-serif" }}>{label}</div>
      <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{desc}</div>
    </button>
  )
}

const PRESETS = [
  { label: "Light Shower",    desc: "30mm, low blockage, 10 pumps",   values: { rainfall: 30,  blockage: 0.1, pumps: 10, capacity: 120 } },
  { label: "Moderate Rain",   desc: "80mm, medium blockage, 8 pumps", values: { rainfall: 80,  blockage: 0.3, pumps: 8,  capacity: 120 } },
  { label: "Heavy Monsoon",   desc: "160mm, high blockage, 6 pumps",  values: { rainfall: 160, blockage: 0.6, pumps: 6,  capacity: 120 } },
  { label: "Extreme Event",   desc: "250mm, severe blockage, 4 pumps",values: { rainfall: 250, blockage: 0.85,pumps: 4,  capacity: 120 } },
]

export default function ForecastPage() {
  const [rainfall, setRainfall] = useState(100)
  const [blockage, setBlockage] = useState(0.3)
  const [pumps, setPumps] = useState(8)
  const [capacity, setCapacity] = useState(120)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const applyPreset = ({ rainfall, blockage, pumps, capacity }) => {
    setRainfall(rainfall); setBlockage(blockage); setPumps(pumps); setCapacity(capacity)
    setResult(null)
  }

  const runForecast = async () => {
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await api.post("/forecast/flood-forecast", {
        rainfall_mm: rainfall,
        drain_blockage_factor: blockage,
        pumps_deployed: pumps,
        pump_capacity_lps: capacity
      })
      setResult(res.data)
    } catch (e) {
      setError(e?.response?.data?.message || "Forecast failed")
    } finally {
      setLoading(false)
    }
  }

  const severity =
    result?.flood_grids > 500 ? { label: "SEVERE", color: "var(--red)" } :
    result?.flood_grids > 200 ? { label: "HIGH",   color: "var(--amber)" } :
    result?.flood_grids > 50  ? { label: "MODERATE",color: "var(--accent)" } :
                                 { label: "LOW",    color: "var(--green)" }

  return (
    <div className="h-full overflow-y-auto px-6 py-6" style={{ background: "var(--bg)" }}>

      {/* Header */}
      <div className="mb-6">
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "Instrument Sans, sans-serif", marginBottom: 2 }}>
          Pre-Monsoon Planning
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-1)", fontFamily: "Bricolage Grotesque, sans-serif", margin: 0 }}>
          Flood Forecast Simulator
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4, marginBottom: 0 }}>
          Model "what-if" rainfall scenarios weeks before monsoon arrives. Adjust parameters to see how many grids flood and how many pumps are needed.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* LEFT: Controls */}
        <div className="lg:col-span-1 space-y-4">

          {/* Scenario presets */}
          <div className="card p-4">
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, fontFamily: "Instrument Sans, sans-serif" }}>
              Quick Scenarios
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map(p => <ScenarioPreset key={p.label} {...p} onApply={applyPreset} />)}
            </div>
          </div>

          {/* Parameters */}
          <div className="card p-4">
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14, fontFamily: "Instrument Sans, sans-serif" }}>
              Parameters
            </div>
            <SliderField label="Expected Rainfall" value={rainfall} min={0} max={300} onChange={setRainfall} unit=" mm" color="var(--accent)" />
            <SliderField label="Drain Blockage Factor" value={blockage} min={0} max={1} step={0.05} onChange={setBlockage} unit="%" color="var(--red)" />
            <NumberField label="Pumps Available to Deploy" value={pumps} onChange={setPumps} unit="units" />
            <NumberField label="Pump Capacity" value={capacity} onChange={setCapacity} unit="LPS" />

            {error && (
              <div className="rounded-lg p-3 mb-3" style={{ background: "var(--red-light)", color: "var(--red)", fontSize: 12 }}>
                {error}
              </div>
            )}

            <button
              onClick={runForecast}
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: loading ? "var(--border)" : "var(--accent)",
                color: loading ? "var(--text-3)" : "#fff",
                fontFamily: "Bricolage Grotesque, sans-serif",
                boxShadow: loading ? "none" : "0 2px 12px rgba(27,98,240,0.3)",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Running forecast…" : "Run Forecast"}
            </button>
          </div>

        </div>

        {/* RIGHT: Results */}
        <div className="lg:col-span-2 space-y-4">

          {!result && !loading && (
            <div className="card p-12 text-center" style={{ border: "2px dashed var(--border)" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🌧️</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-2)", fontFamily: "Bricolage Grotesque, sans-serif" }}>
                Configure a scenario and run forecast
              </div>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>
                Results will show predicted flood coverage, ward impact and pump requirements
              </div>
            </div>
          )}

          {loading && (
            <div className="card p-8 text-center">
              <div className="w-8 h-8 rounded-full border-2 mx-auto mb-4" style={{ borderColor: "var(--accent)", borderTopColor: "transparent", animation: "spin .7s linear infinite" }} />
              <div style={{ fontSize: 13, color: "var(--text-3)" }}>Running ML + formula forecast…</div>
            </div>
          )}

          {result && !loading && (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Flood Grids",      value: result.flood_grids,       color: "var(--red)"    },
                  { label: "High Risk Wards",  value: result.high_risk_wards?.length ?? "—", color: "var(--amber)" },
                  { label: "Rec. Pumps",       value: result.recommended_pumps, color: "var(--accent)" },
                  { label: "Severity",         value: severity.label,           color: severity.color  }
                ].map(({ label, value, color }, i) => (
                  <div key={label} className="card p-4 result-card" style={{ animationDelay: `${i * 60}ms` }}>
                    <div style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, fontFamily: "Instrument Sans, sans-serif" }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "Bricolage Grotesque, sans-serif", lineHeight: 1 }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pump gap analysis */}
              <div className="card p-4">
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", fontFamily: "Bricolage Grotesque, sans-serif", marginBottom: 12 }}>
                  Pump Gap Analysis
                </div>
                <div className="flex items-center gap-4">
                  {[
                    { label: "Pumps Deployed",    value: pumps,                    color: "var(--accent)" },
                    { label: "Pumps Required",    value: result.recommended_pumps, color: result.recommended_pumps > pumps ? "var(--red)" : "var(--green)" },
                    { label: "Gap",               value: Math.max(0, (result.recommended_pumps || 0) - pumps), color: "var(--red)" }
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex-1 text-center">
                      <div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: "Bricolage Grotesque, sans-serif" }}>{value}</div>
                      <div style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>{label}</div>
                    </div>
                  ))}
                </div>
                {result.recommended_pumps > pumps && (
                  <div className="mt-4 rounded-xl p-3" style={{ background: "var(--red-light)", border: "1px solid rgba(229,62,62,0.2)" }}>
                    <span style={{ fontSize: 12, color: "var(--red)", fontWeight: 600 }}>
                      ⚠️ Pump shortage: {result.recommended_pumps - pumps} additional pumps needed before this rainfall event.
                    </span>
                  </div>
                )}
              </div>

              {/* High risk wards list */}
              {result.high_risk_wards?.length > 0 && (
                <div className="card overflow-hidden">
                  <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", fontFamily: "Bricolage Grotesque, sans-serif" }}>
                      High Risk Wards ({result.high_risk_wards.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 p-4">
                    {result.high_risk_wards.map(w => (
                      <span key={w} className="px-3 py-1.5 rounded-lg text-sm"
                        style={{ background: "var(--red-light)", color: "var(--red)", border: "1px solid rgba(229,62,62,0.2)", fontFamily: "Fira Code, monospace" }}>
                        Ward {w}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Example grids table */}
              {result.example_grids?.length > 0 && (
                <div className="card overflow-hidden">
                  <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", fontFamily: "Bricolage Grotesque, sans-serif" }}>
                      Top Flood Grids (sample)
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full" style={{ borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
                          {["Grid ID", "Ward", "Base Risk", "Flood Risk"].map(h => (
                            <th key={h} className="px-5 py-3 text-left" style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "Instrument Sans, sans-serif" }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.example_grids.slice(0, 15).map((g, i) => {
                          const risk = g.simulated_risk ?? g.risk_score ?? 0
                          const color = risk > 0.7 ? "var(--red)" : risk > 0.4 ? "var(--amber)" : "var(--green)"
                          return (
                            <tr key={i} className="data-row" style={{ borderBottom: "1px solid var(--border)" }}>
                              <td className="px-5 py-2.5" style={{ fontSize: 12, fontFamily: "Fira Code, monospace", color: "var(--text-1)", fontWeight: 600 }}>
                                {g.grid_id}
                              </td>
                              <td className="px-5 py-2.5" style={{ fontSize: 12, color: "var(--text-2)" }}>{g.ward_id}</td>
                              <td className="px-5 py-2.5" style={{ fontSize: 12, fontFamily: "Fira Code, monospace", color: "var(--text-2)" }}>
                                {g.risk_score?.toFixed(2)}
                              </td>
                              <td className="px-5 py-2.5">
                                <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "Fira Code, monospace" }}>
                                  {risk.toFixed(2)}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}