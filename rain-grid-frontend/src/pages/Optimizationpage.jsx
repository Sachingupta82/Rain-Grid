import { useEffect, useState } from "react"
import { api } from "../api/api"

// GET /optimization/optimal-pump-placement
// Returns top 20 grids with risk_score > 0.7, sorted desc
// Each item: { grid_id, ward_id, ward_name, risk_score, recommended_action, elevation, slope }

function RiskBar({ score }) {
  const color = score > 0.8 ? "var(--red)" : score > 0.6 ? "var(--amber)" : "var(--accent)"
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)", maxWidth: 80 }}>
        <div className="h-full rounded-full" style={{ width: `${score * 100}%`, background: color }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "Fira Code, monospace" }}>
        {score.toFixed(2)}
      </span>
    </div>
  )
}

function PumpCard({ grid, rank, checked, onToggle }) {
  const riskColor = grid.risk_score > 0.8 ? "var(--red)" : grid.risk_score > 0.6 ? "var(--amber)" : "var(--accent)"

  return (
    <div
      className="card p-4 transition-all duration-150 cursor-pointer anim-fade-up"
      style={{
        background: checked ? "var(--accent-light)" : "var(--surface)",
        borderColor: checked ? "var(--accent)" : "var(--border)",
        borderWidth: checked ? 2 : 1
      }}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">

        {/* Rank + checkbox */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: riskColor + "22", color: riskColor, fontFamily: "Bricolage Grotesque, sans-serif" }}
          >
            {rank}
          </div>
          <div
            className="w-5 h-5 rounded flex items-center justify-center border-2 transition"
            style={{ borderColor: checked ? "var(--accent)" : "var(--border-strong)", background: checked ? "var(--accent)" : "transparent" }}
          >
            {checked && <span style={{ color: "#fff", fontSize: 11, lineHeight: 1 }}>✓</span>}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", fontFamily: "Bricolage Grotesque, sans-serif" }}>
              Grid {grid.grid_id}
            </span>
            <span style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: 5, padding: "1px 7px", fontSize: 11, fontFamily: "Fira Code, monospace" }}>
              Ward {grid.ward_id}
            </span>
          </div>

          {grid.ward_name && (
            <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 6 }}>{grid.ward_name}</div>
          )}

          <RiskBar score={grid.risk_score} />

          <div className="grid grid-cols-2 gap-x-3 mt-2">
            {[
              { l: "Elevation", v: grid.elevation ?? "—" },
              { l: "Slope",     v: grid.slope     ?? "—" }
            ].map(({ l, v }) => (
              <div key={l}>
                <span style={{ fontSize: 9, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{l} </span>
                <span style={{ fontSize: 11, color: "var(--text-2)", fontFamily: "Fira Code, monospace" }}>{v}</span>
              </div>
            ))}
          </div>

          <div className="mt-2 flex items-center gap-1.5">
            <span style={{ fontSize: 10, color: "var(--green)", background: "var(--green-light)", border: "1px solid rgba(13,145,103,0.2)", borderRadius: 5, padding: "1px 7px", fontWeight: 600 }}>
              {grid.recommended_action || "Deploy mobile pump"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OptimizationPage() {
  const [grids, setGrids] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [checked, setChecked] = useState({})

  useEffect(() => {
    api.get("/optimization/optimal-pump-placement")
      .then(r => setGrids(r.data.optimal_placements || r.data || []))
      .catch(e => setError(e?.response?.data?.message || "Failed to load"))
      .finally(() => setLoading(false))
  }, [])

  const toggleCheck = id => setChecked(c => ({ ...c, [id]: !c[id] }))
  const checkAll = () => {
    const all = {}
    grids.forEach(g => { all[g.grid_id] = true })
    setChecked(all)
  }
  const clearAll = () => setChecked({})

  const doneCount = Object.values(checked).filter(Boolean).length
  const progress = grids.length ? Math.round((doneCount / grids.length) * 100) : 0

  // Group by ward
  const byWard = grids.reduce((acc, g) => {
    const w = g.ward_id || "Unknown"
    if (!acc[w]) acc[w] = []
    acc[w].push(g)
    return acc
  }, {})

  return (
    <div className="h-full overflow-y-auto px-6 py-6" style={{ background: "var(--bg)" }}>

      <div className="mb-6">
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "Instrument Sans, sans-serif", marginBottom: 2 }}>
          Pre-Monsoon Planning
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-1)", fontFamily: "Bricolage Grotesque, sans-serif", margin: 0 }}>
          Optimal Pump Placement
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4 }}>
          Top grids ranked by flood risk where mobile pumps should be pre-positioned before monsoon. Check off grids as pumps are physically deployed.
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({length: 8}).map((_,i) => <div key={i} className="skeleton h-40 rounded-xl" />)}
        </div>
      )}

      {error && (
        <div className="card p-5" style={{ background: "var(--red-light)", border: "1px solid rgba(229,62,62,0.2)", color: "var(--red)" }}>
          {error}
        </div>
      )}

      {!loading && grids.length > 0 && (
        <>
          {/* Progress bar */}
          <div className="card p-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)", fontFamily: "Bricolage Grotesque, sans-serif" }}>
                  Deployment Checklist
                </span>
                <span style={{ fontSize: 13, color: "var(--text-3)", marginLeft: 10 }}>
                  {doneCount} / {grids.length} sites confirmed
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={checkAll} className="text-xs px-3 py-1.5 rounded-lg transition"
                  style={{ background: "var(--accent-light)", color: "var(--accent)", border: "1px solid rgba(27,98,240,0.2)" }}>
                  Mark All Done
                </button>
                <button onClick={clearAll} className="text-xs px-3 py-1.5 rounded-lg transition"
                  style={{ background: "var(--surface-2)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
                  Clear
                </button>
              </div>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: progress === 100 ? "var(--green)" : "var(--accent)" }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span style={{ fontSize: 10, color: "var(--text-3)" }}>0%</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: progress === 100 ? "var(--green)" : "var(--accent)" }}>
                {progress}% deployed
              </span>
              <span style={{ fontSize: 10, color: "var(--text-3)" }}>100%</span>
            </div>
          </div>

          {/* Ward grouping */}
          {Object.entries(byWard).map(([wardId, wardGrids]) => (
            <div key={wardId} className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", background: "var(--accent-light)", borderRadius: 6, padding: "2px 10px", fontFamily: "Fira Code, monospace" }}>
                  Ward {wardId}
                </span>
                <span style={{ fontSize: 11, color: "var(--text-3)" }}>
                  {wardGrids.filter(g => checked[g.grid_id]).length}/{wardGrids.length} placed
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {wardGrids.map((grid, i) => (
                  <div key={grid.grid_id} style={{ animationDelay: `${i * 30}ms` }}>
                    <PumpCard
                      grid={grid}
                      rank={grids.indexOf(grid) + 1}
                      checked={!!checked[grid.grid_id]}
                      onToggle={() => toggleCheck(grid.grid_id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}