import { useEffect, useMemo, useState } from "react"
import { api } from "../../api/api"
import { ChevronDown } from "lucide-react"

export default function CityPanel() {
  const [stats, setStats] = useState(null)
  const [readiness, setReadiness] = useState(null)
  const [pumps, setPumps] = useState(null)
  const [open, setOpen] = useState(true)

  useEffect(() => {
    api.get("admin/statistics").then(r => setStats(r.data)).catch(() => {})
    api.get("/readiness/ward-readiness").then(r => setReadiness(r.data)).catch(() => {})
    api.get("/pumps").then(r => setPumps(r.data.pumps || [])).catch(() => {})
  }, [])

  const critical = readiness?.filter(r => r.status === "CRITICAL") || []
  const highRisk  = readiness?.filter(r => r.status === "HIGH RISK") || []

  const topCritical = [...critical]
    .sort((a, b) => a.readiness_score - b.readiness_score)
    .slice(0, 3)

  const pumpStats = useMemo(() => {
    if (!pumps) return null
    return {
      total:     pumps.length,
      deployed:  pumps.filter(p => p.status === "deployed").length,
      available: pumps.filter(p => p.status === "available").length
    }
  }, [pumps])

  if (!stats && !readiness && !pumps) return null

  return (
    <div className="absolute bottom-4 left-4 z-[1000] rounded-2xl overflow-hidden bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl" style={{ width: 272 }}>

      {/* Header */}
      <div
        className={`flex items-center justify-between px-3.5 py-2.5 cursor-pointer ${open ? "border-b border-slate-100" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-50" />
          </div>
          <span className="text-sm font-bold text-slate-900 tracking-tight">City Overview</span>
        </div>
        <div className="flex items-center gap-2">
          {critical.length > 0 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
              {critical.length} critical
            </span>
          )}
          <ChevronDown
            size={14}
            className="text-slate-400 transition-transform duration-200"
            style={{ transform: open ? "rotate(0deg)" : "rotate(180deg)" }}
          />
        </div>
      </div>

      {open && (
        <div className="px-3.5 py-3 space-y-3">

          {/* Grid stats */}
          {stats && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Wards",     value: stats.total_wards,     color: "#2563eb" },
                { label: "Grids",     value: stats.total_grids,     color: "#0f172a" },
                { label: "High Risk", value: stats.high_risk_grids, color: "#dc2626" }
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center bg-slate-50 rounded-xl py-2 border border-slate-100">
                  <div className="text-lg font-bold tracking-tight" style={{ color }}>{value ?? "—"}</div>
                  <div className="text-[10px] font-medium text-slate-400 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Pump status */}
          {pumpStats && (
            <div className="flex gap-1.5">
              {[
                { label: "Total",     value: pumpStats.total,     color: "#0f172a" },
                { label: "Deployed",  value: pumpStats.deployed,  color: "#059669" },
                { label: "Available", value: pumpStats.available, color: "#2563eb" }
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="flex-1 rounded-xl py-2 text-center bg-white border border-slate-200"
                >
                  <div className="text-sm font-bold tracking-tight" style={{ color }}>{value}</div>
                  <div className="text-[9px] font-medium text-slate-400 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Critical wards */}
          {topCritical.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
                Critical Wards
              </p>
              <div className="space-y-1.5">
                {topCritical.map(w => (
                  <div
                    key={w.ward_id}
                    className="flex items-center justify-between rounded-xl px-2.5 py-1.5 bg-red-50 border border-red-200"
                  >
                    <span className="text-xs font-semibold text-red-700">Ward {w.ward_id}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 rounded-full bg-red-100 overflow-hidden" style={{ width: 40 }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${w.readiness_score}%`,
                            backgroundColor: w.readiness_score < 40 ? "#dc2626" : "#d97706"
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-bold font-mono text-red-600">{w.readiness_score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}