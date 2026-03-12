import { useEffect, useState } from "react"
import { api } from "../api/api"

// GET /infrastructure/infrastructure-risk
// Returns: { construction_zones, road_digging_zones, complaint_hotspots, drain_cleaning_zones }
// Each item: { grid_id, ward_id, ward_name, events: [...] }

const ZONE_CONFIG = {
  construction_zones: {
    label: "Construction Zones",
    desc: "Active construction near drains — high blockage risk",
    icon: "🏗️",
    color: "var(--red)",
    bg: "var(--red-light)",
    border: "rgba(229,62,62,0.2)"
  },
  road_digging_zones: {
    label: "Road Digging Zones",
    desc: "Road excavation disrupting drainage flow",
    icon: "🚧",
    color: "var(--amber)",
    bg: "var(--amber-light)",
    border: "rgba(217,119,6,0.2)"
  },
  complaint_hotspots: {
    label: "Complaint Hotspots",
    desc: "Grids with resident flooding complaints",
    icon: "📋",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "rgba(124,58,237,0.2)"
  },
  drain_cleaning_zones: {
    label: "Drain Cleaning Done",
    desc: "Recently serviced drains — reduced risk",
    icon: "✅",
    color: "var(--green)",
    bg: "var(--green-light)",
    border: "rgba(13,145,103,0.2)"
  }
}

function ZoneSummaryCard({ zoneKey, zones, selected, onClick }) {
  const cfg = ZONE_CONFIG[zoneKey]
  const isSelected = selected === zoneKey
  return (
    <button
      onClick={() => onClick(isSelected ? null : zoneKey)}
      className="card p-4 text-left w-full transition-all duration-150 anim-fade-up"
      style={{
        background: isSelected ? cfg.bg : "var(--surface)",
        borderColor: isSelected ? cfg.color : "var(--border)",
        borderWidth: isSelected ? 2 : 1,
        transform: isSelected ? "none" : ""
      }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = cfg.color }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = "var(--border)" }}
    >
      <div className="flex items-start justify-between mb-2">
        <span style={{ fontSize: 24 }}>{cfg.icon}</span>
        <span
          className="px-2 py-0.5 rounded-full text-xs font-bold"
          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
        >
          {zones?.length ?? 0}
        </span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", fontFamily: "Bricolage Grotesque, sans-serif", marginBottom: 2 }}>
        {cfg.label}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-3)" }}>{cfg.desc}</div>
    </button>
  )
}

function ZoneTable({ zoneKey, zones }) {
  const cfg = ZONE_CONFIG[zoneKey]
  const [search, setSearch] = useState("")

  const filtered = zones.filter(z =>
    !search || z.grid_id?.toString().includes(search) ||
    z.ward_name?.toLowerCase().includes(search.toLowerCase()) ||
    z.ward_id?.toString().includes(search)
  )

  return (
    <div className="card overflow-hidden anim-fade-up">
      <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 18 }}>{cfg.icon}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", fontFamily: "Bricolage Grotesque, sans-serif" }}>
            {cfg.label}
          </span>
          <span className="badge" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
            {zones.length} grids
          </span>
        </div>
        <input
          placeholder="Search grid / ward…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="rounded-lg px-3 py-1.5 text-xs outline-none transition"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-1)", width: 180 }}
          onFocus={e => { e.target.style.borderColor = "var(--accent)" }}
          onBlur={e => { e.target.style.borderColor = "var(--border)" }}
        />
      </div>
      <div className="overflow-x-auto max-h-96 overflow-y-auto">
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
              {["Grid ID", "Ward", "Event Count", "Latest Events"].map(h => (
                <th key={h} className="px-5 py-3 text-left" style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "Instrument Sans, sans-serif" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 60).map((zone, i) => (
              <tr key={i} className="data-row" style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="px-5 py-2.5" style={{ fontSize: 12, fontFamily: "Fira Code, monospace", color: cfg.color, fontWeight: 600 }}>
                  {zone.grid_id}
                </td>
                <td className="px-5 py-2.5">
                  <span style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: 6, padding: "1px 7px", fontSize: 12, fontFamily: "Fira Code, monospace" }}>
                    Ward {zone.ward_id}
                  </span>
                  {zone.ward_name && (
                    <span style={{ fontSize: 11, color: "var(--text-3)", marginLeft: 6 }}>{zone.ward_name}</span>
                  )}
                </td>
                <td className="px-5 py-2.5">
                  <span style={{ fontSize: 13, fontWeight: 700, color: cfg.color, fontFamily: "Fira Code, monospace" }}>
                    {zone.events?.length ?? 0}
                  </span>
                </td>
                <td className="px-5 py-2.5">
                  <div className="flex gap-1 flex-wrap">
                    {zone.events?.slice(0, 3).map((ev, j) => (
                      <span key={j} style={{ fontSize: 10, color: "var(--text-3)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 4, padding: "1px 6px", fontFamily: "Fira Code, monospace" }}>
                        {ev.date}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function InfrastructurePage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState("construction_zones")

  useEffect(() => {
    api.get("/infrastructure/infrastructure-risk")
      .then(r => setData(r.data))
      .catch(e => setError(e?.response?.data?.message || "Failed to load"))
      .finally(() => setLoading(false))
  }, [])

  const totalAffected = data
    ? Object.values(data).reduce((s, arr) => s + (arr?.length || 0), 0)
    : 0

  return (
    <div className="h-full overflow-y-auto px-6 py-6" style={{ background: "var(--bg)" }}>

      <div className="mb-6">
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "Instrument Sans, sans-serif", marginBottom: 2 }}>
          Pre-Monsoon Planning
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-1)", fontFamily: "Bricolage Grotesque, sans-serif", margin: 0 }}>
          Infrastructure Risk Zones
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4 }}>
          Human activities that increase flood risk — construction, road digging and unresolved complaints near drainage corridors.
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
      )}

      {error && (
        <div className="card p-5" style={{ background: "var(--red-light)", border: "1px solid rgba(229,62,62,0.2)", color: "var(--red)" }}>
          {error}
        </div>
      )}

      {data && (
        <>
          {/* Top banner */}
          <div className="card p-4 mb-5 flex items-center gap-4" style={{ background: "var(--amber-light)", borderColor: "rgba(217,119,6,0.2)" }}>
            <span style={{ fontSize: 32 }}>⚠️</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "var(--amber)", fontFamily: "Bricolage Grotesque, sans-serif" }}>
                {totalAffected} grids have active infrastructure risk events
              </div>
              <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>
                These should be resolved or monitored before monsoon onset to prevent avoidable flooding.
              </div>
            </div>
          </div>

          {/* Zone type selector cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {Object.keys(ZONE_CONFIG).map((key, i) => (
              <div key={key} style={{ animationDelay: `${i * 50}ms` }}>
                <ZoneSummaryCard
                  zoneKey={key}
                  zones={data[key] || []}
                  selected={selected}
                  onClick={setSelected}
                />
              </div>
            ))}
          </div>

          {/* Detail table for selected zone */}
          {selected && data[selected]?.length > 0 && (
            <ZoneTable zoneKey={selected} zones={data[selected]} />
          )}
          {selected && data[selected]?.length === 0 && (
            <div className="card p-10 text-center">
              <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-2)", fontFamily: "Bricolage Grotesque, sans-serif" }}>
                No active {ZONE_CONFIG[selected]?.label.toLowerCase()} found
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}