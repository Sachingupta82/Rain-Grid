import { useEffect, useState } from "react"
import { api } from "../api/api"

// GET /flood/clusters
// Returns: { clusters: [{ grid_id, ward_id, ward_name, risk_level, water_level, risk }] }

function WaterMeter({ level }) {
  const pct = Math.min(Math.max(level * 100, 0), 100)
  const color =
    pct > 70 ? "var(--red)" :
    pct > 40 ? "var(--amber)" :
    "var(--accent)"

  return (
    <div className="flex items-end gap-1" style={{ height: 36 }}>
      {[20, 40, 60, 80, 100].map(threshold => (
        <div
          key={threshold}
          className="w-1.5 rounded-full transition-all duration-500"
          style={{
            height: `${threshold * 0.36}px`,
            background: pct >= threshold ? color : "var(--border)",
            opacity: pct >= threshold ? 1 : 0.4
          }}
        />
      ))}
      <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: "Fira Code, monospace", marginLeft: 4 }}>
        {level != null ? level.toFixed(2) : "—"}
      </span>
    </div>
  )
}

function ClusterCard({ cluster, index }) {
  const isCritical = cluster.risk === "HIGH" || cluster.risk_level === "HIGH"
  return (
    <div
      className="card p-4 anim-fade-up"
      style={{
        animationDelay: `${index * 35}ms`,
        borderLeft: `3px solid ${isCritical ? "var(--red)" : "var(--amber)"}`
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-1)", fontFamily: "Bricolage Grotesque, sans-serif" }}>
            Grid {cluster.grid_id}
          </div>
          <span style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: 5, padding: "1px 7px", fontSize: 11, fontFamily: "Fira Code, monospace", marginTop: 3, display: "inline-block" }}>
            Ward {cluster.ward_id}
          </span>
          {cluster.ward_name && (
            <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 2 }}>{cluster.ward_name}</div>
          )}
        </div>
        <span
          className="badge"
          style={{
            background: isCritical ? "var(--red-light)" : "var(--amber-light)",
            color: isCritical ? "var(--red)" : "var(--amber)",
            border: `1px solid ${isCritical ? "rgba(229,62,62,0.2)" : "rgba(217,119,6,0.2)"}`,
            display: "flex", alignItems: "center", gap: 5
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{
              background: isCritical ? "var(--red)" : "var(--amber)",
              animation: "pulse-dot 1.2s ease-in-out infinite"
            }}
          />
          {cluster.risk || cluster.risk_level || "HIGH"}
        </span>
      </div>
      <div>
        <div style={{ fontSize: 9, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
          Water Level
        </div>
        <WaterMeter level={cluster.water_level} />
      </div>
    </div>
  )
}

function WardClusterGroup({ wardId, wardName, clusters }) {
  const maxLevel = Math.max(...clusters.map(c => c.water_level || 0))
  const critCount = clusters.filter(c => c.risk === "HIGH" || c.risk_level === "HIGH").length

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-3">
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", background: "var(--accent-light)", borderRadius: 6, padding: "2px 10px", fontFamily: "Fira Code, monospace" }}>
          Ward {wardId}
        </span>
        {wardName && <span style={{ fontSize: 12, color: "var(--text-2)" }}>{wardName}</span>}
        <span style={{ fontSize: 11, color: "var(--text-3)" }}>·</span>
        <span style={{ fontSize: 11, color: "var(--red)" }}>{critCount} critical grid{critCount !== 1 ? "s" : ""}</span>
        <span style={{ fontSize: 11, color: "var(--text-3)" }}>·</span>
        <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "Fira Code, monospace" }}>
          max water: {maxLevel.toFixed(2)}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {clusters.map((c, i) => <ClusterCard key={c.grid_id} cluster={c} index={i} />)}
      </div>
    </div>
  )
}

export default function FloodClustersPage() {
  const [clusters, setClusters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [viewMode, setViewMode] = useState("ward") // ward | flat

  const load = () => {
    setLoading(true)
    api.get("/flood/clusters")
      .then(r => {
        setClusters(r.data.clusters || r.data || [])
        setLastRefresh(new Date())
      })
      .catch(e => setError(e?.response?.data?.message || "Failed to load clusters"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000) // auto-refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const byWard = clusters.reduce((acc, c) => {
    const w = c.ward_id || "Unknown"
    if (!acc[w]) acc[w] = { wardId: w, wardName: c.ward_name, clusters: [] }
    acc[w].clusters.push(c)
    return acc
  }, {})

  const affectedWards = Object.keys(byWard).length
  const avgWaterLevel = clusters.length
    ? (clusters.reduce((s, c) => s + (c.water_level || 0), 0) / clusters.length).toFixed(2)
    : "—"

  return (
    <div className="h-full overflow-y-auto px-6 py-6" style={{ background: "var(--bg)" }}>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "Instrument Sans, sans-serif", marginBottom: 2 }}>
            Live Monitoring
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-1)", fontFamily: "Bricolage Grotesque, sans-serif", margin: 0 }}>
            Active Flood Clusters
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4, marginBottom: 0 }}>
            Real-time HIGH risk grids with elevated water levels from simulation data. Auto-refreshes every 30s.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "Fira Code, monospace" }}>
            Last sync: {lastRefresh.toLocaleTimeString()}
          </span>
          <button onClick={load} className="px-3 py-1.5 rounded-lg text-xs font-medium transition card"
            style={{ color: "var(--accent)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--accent-light)" }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--surface)" }}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
      )}

      {error && (
        <div className="card p-5 mb-5" style={{ background: "var(--red-light)", border: "1px solid rgba(229,62,62,0.2)", color: "var(--red)", fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      {!loading && clusters.length === 0 && !error && (
        <div className="card p-16 text-center">
          <div style={{ fontSize: 48, marginBottom: 10 }}>✅</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--green)", fontFamily: "Bricolage Grotesque, sans-serif" }}>
            No active flood clusters
          </div>
          <div style={{ fontSize: 13, color: "var(--text-3)", marginTop: 6 }}>
            All grids are currently below HIGH risk threshold
          </div>
        </div>
      )}

      {!loading && clusters.length > 0 && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "Active Clusters",  value: clusters.length, color: "var(--red)"   },
              { label: "Wards Affected",   value: affectedWards,   color: "var(--amber)" },
              { label: "Avg Water Level",  value: avgWaterLevel,   color: "var(--accent)"}
            ].map(({ label, value, color }, i) => (
              <div key={label} className="card p-4 anim-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                <div style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, fontFamily: "Instrument Sans, sans-serif" }}>
                  {label}
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color, fontFamily: "Bricolage Grotesque, sans-serif", lineHeight: 1 }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex gap-1 mb-5">
            {[["ward","Group by Ward"],["flat","All Clusters"]].map(([k,l]) => (
              <button key={k} onClick={() => setViewMode(k)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition"
                style={{ background: viewMode === k ? "var(--accent)" : "var(--surface)", color: viewMode === k ? "#fff" : "var(--text-2)", border: `1px solid ${viewMode === k ? "var(--accent)" : "var(--border)"}` }}>
                {l}
              </button>
            ))}
          </div>

          {/* Ward grouped view */}
          {viewMode === "ward" && (
            Object.values(byWard)
              .sort((a, b) => b.clusters.length - a.clusters.length)
              .map(({ wardId, wardName, clusters: wc }) => (
                <WardClusterGroup key={wardId} wardId={wardId} wardName={wardName} clusters={wc} />
              ))
          )}

          {/* Flat table view */}
          {viewMode === "flat" && (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full" style={{ borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
                      {["Grid", "Ward", "Risk Level", "Water Level", "Status"].map(h => (
                        <th key={h} className="px-5 py-3 text-left" style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "Instrument Sans, sans-serif" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {clusters.map((c, i) => {
                      const isCrit = c.risk === "HIGH" || c.risk_level === "HIGH"
                      return (
                        <tr key={c.grid_id} className="data-row" style={{ borderBottom: "1px solid var(--border)", animationDelay: `${i * 20}ms` }}>
                          <td className="px-5 py-3" style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", fontFamily: "Fira Code, monospace" }}>
                            {c.grid_id}
                          </td>
                          <td className="px-5 py-3">
                            <span style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: 5, padding: "1px 7px", fontSize: 12, fontFamily: "Fira Code, monospace" }}>
                              Ward {c.ward_id}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className="badge" style={{ background: isCrit ? "var(--red-light)" : "var(--amber-light)", color: isCrit ? "var(--red)" : "var(--amber)", border: `1px solid ${isCrit ? "rgba(229,62,62,0.2)" : "rgba(217,119,6,0.2)"}` }}>
                              {c.risk || c.risk_level}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <WaterMeter level={c.water_level} />
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full" style={{ background: isCrit ? "var(--red)" : "var(--amber)", animation: "pulse-dot 1.2s ease-in-out infinite", display: "inline-block" }} />
                              <span style={{ fontSize: 12, color: isCrit ? "var(--red)" : "var(--amber)", fontWeight: 600 }}>Active</span>
                            </div>
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
  )
}