import { useEffect, useState } from "react"
import { api } from "../api/api"

// GET /spread/flood-spread
// Returns up to 30 zones with risk_score > 0.75 + predicted_spread message
// Each item: { grid_id, ward_id, ward_name, risk_score, risk_level, predicted_spread, elevation, slope }

function SpreadZoneRow({ zone, index }) {
  const riskColor =
    zone.risk_score > 0.85 ? "var(--red)"   :
    zone.risk_score > 0.75 ? "var(--amber)" : "var(--accent)"

  return (
    <tr className="data-row anim-fade-up" style={{ borderBottom: "1px solid var(--border)", animationDelay: `${index * 30}ms` }}>
      <td className="px-5 py-3">
        <div style={{ fontSize: 13, fontWeight: 700, color: riskColor, fontFamily: "Fira Code, monospace" }}>
          Grid {zone.grid_id}
        </div>
      </td>
      <td className="px-5 py-3">
        <span style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: 5, padding: "1px 7px", fontSize: 12, fontFamily: "Fira Code, monospace" }}>
          Ward {zone.ward_id}
        </span>
        {zone.ward_name && (
          <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{zone.ward_name}</div>
        )}
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)", width: 60 }}>
            <div className="h-full rounded-full" style={{ width: `${zone.risk_score * 100}%`, background: riskColor }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: riskColor, fontFamily: "Fira Code, monospace" }}>
            {zone.risk_score?.toFixed(2)}
          </span>
        </div>
      </td>
      <td className="px-5 py-3">
        <div style={{ fontSize: 12, color: "var(--text-1)", maxWidth: 300 }}>
          {zone.predicted_spread || "—"}
        </div>
      </td>
      <td className="px-5 py-3">
        <div className="grid grid-cols-2 gap-x-4" style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "Fira Code, monospace" }}>
          <span>Elev: {zone.elevation ?? "—"}</span>
          <span>Slope: {zone.slope ?? "—"}</span>
        </div>
      </td>
    </tr>
  )
}

function WardSpreadSummary({ zones }) {
  // Group by ward and count
  const byWard = zones.reduce((acc, z) => {
    const w = z.ward_id
    if (!acc[w]) acc[w] = { ward_id: w, ward_name: z.ward_name, count: 0, maxRisk: 0 }
    acc[w].count++
    if (z.risk_score > acc[w].maxRisk) acc[w].maxRisk = z.risk_score
    return acc
  }, {})

  const sorted = Object.values(byWard).sort((a, b) => b.maxRisk - a.maxRisk)

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", fontFamily: "Bricolage Grotesque, sans-serif" }}>
          Affected Wards
        </span>
      </div>
      <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-2">
        {sorted.map(w => {
          const color = w.maxRisk > 0.85 ? "var(--red)" : w.maxRisk > 0.75 ? "var(--amber)" : "var(--accent)"
          return (
            <div key={w.ward_id} className="rounded-xl p-3 anim-fade-up"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="flex justify-between items-center mb-1">
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-1)", fontFamily: "Fira Code, monospace" }}>
                  Ward {w.ward_id}
                </span>
                <span style={{ fontSize: 11, color, fontWeight: 700, fontFamily: "Fira Code, monospace" }}>
                  {w.maxRisk.toFixed(2)}
                </span>
              </div>
              {w.ward_name && (
                <div style={{ fontSize: 10, color: "var(--text-3)", marginBottom: 4 }}>{w.ward_name}</div>
              )}
              <div style={{ fontSize: 11, color: "var(--text-3)" }}>
                {w.count} spread zone{w.count !== 1 ? "s" : ""}
              </div>
              <div className="h-1 rounded-full mt-2 overflow-hidden" style={{ background: "var(--border)" }}>
                <div style={{ width: `${w.maxRisk * 100}%`, height: "100%", background: color, borderRadius: 999 }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function FloodSpreadPage() {
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortKey, setSortKey] = useState("risk_score")
  const [search, setSearch] = useState("")

  useEffect(() => {
    api.get("/spread/flood-spread")
      .then(r => setZones(r.data.spread_zones || r.data || []))
      .catch(e => setError(e?.response?.data?.message || "Failed to load"))
      .finally(() => setLoading(false))
  }, [])

  const filtered = zones
    .filter(z =>
      !search ||
      z.grid_id?.toString().includes(search) ||
      z.ward_id?.toString().includes(search) ||
      z.ward_name?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortKey === "risk_score") return b.risk_score - a.risk_score
      if (sortKey === "ward")       return (a.ward_id || "").localeCompare(b.ward_id || "")
      return 0
    })

  const severeCount = zones.filter(z => z.risk_score > 0.85).length
  const affectedWards = new Set(zones.map(z => z.ward_id)).size

  return (
    <div className="h-full overflow-y-auto px-6 py-6" style={{ background: "var(--bg)" }}>

      <div className="mb-6">
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "Instrument Sans, sans-serif", marginBottom: 2 }}>
          Live Risk Intelligence
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-1)", fontFamily: "Bricolage Grotesque, sans-serif", margin: 0 }}>
          Flood Spread Prediction
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4 }}>
          High-risk grids (score &gt; 0.75) with predicted water spread direction and affected neighbour zones.
        </p>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-12 rounded-xl" />)}
        </div>
      )}

      {error && (
        <div className="card p-5" style={{ background: "var(--red-light)", border: "1px solid rgba(229,62,62,0.2)", color: "var(--red)" }}>
          {error}
        </div>
      )}

      {!loading && zones.length > 0 && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "Spread Zones",    value: zones.length,   color: "var(--red)"    },
              { label: "Severe (>0.85)",  value: severeCount,    color: "var(--amber)"  },
              { label: "Wards Affected",  value: affectedWards,  color: "var(--accent)" }
            ].map(({ label, value, color }, i) => (
              <div key={label} className="card p-4 anim-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, fontFamily: "Instrument Sans, sans-serif" }}>
                  {label}
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "Bricolage Grotesque, sans-serif" }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Ward summary */}
          <div className="mb-5">
            <WardSpreadSummary zones={zones} />
          </div>

          {/* Detailed table */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between flex-wrap gap-3" style={{ borderColor: "var(--border)" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", fontFamily: "Bricolage Grotesque, sans-serif" }}>
                All Spread Zones
              </span>
              <div className="flex gap-3 items-center">
                <input
                  placeholder="Search grid / ward…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="rounded-lg px-3 py-1.5 text-xs outline-none transition"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-1)", width: 180 }}
                  onFocus={e => { e.target.style.borderColor = "var(--accent)" }}
                  onBlur={e => { e.target.style.borderColor = "var(--border)" }}
                />
                <div className="flex gap-1">
                  {[["risk_score","By Risk"],["ward","By Ward"]].map(([k,l]) => (
                    <button key={k} onClick={() => setSortKey(k)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition"
                      style={{ background: sortKey === k ? "var(--accent)" : "var(--surface-2)", color: sortKey === k ? "#fff" : "var(--text-2)", border: `1px solid ${sortKey === k ? "var(--accent)" : "var(--border)"}` }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
                    {["Grid", "Ward", "Risk Score", "Predicted Spread", "Terrain"].map(h => (
                      <th key={h} className="px-5 py-3 text-left" style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "Instrument Sans, sans-serif" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((zone, i) => <SpreadZoneRow key={zone.grid_id} zone={zone} index={i} />)}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}