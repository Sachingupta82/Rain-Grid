import { useEffect, useState } from "react"
import { api } from "../api/api"
import { Activity, Cpu, Waves, AlertTriangle, RefreshCw, Clock } from "lucide-react"

function MetricCard({ label, value, sub, color = "#0f172a", icon: Icon, delay = 0 }) {
  return (
    <div
      className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          {label}
        </span>
        <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
          <Icon size={15} className="text-slate-500" />
        </div>
      </div>
      <div className="text-4xl font-bold tracking-tighter leading-none" style={{ color }}>
        {value ?? "—"}
      </div>
      {sub && (
        <div className="text-xs mt-2 text-slate-400 font-medium">{sub}</div>
      )}
    </div>
  )
}

function IssueRow({ report }) {
  const typeColor = {
    drain_block:   { text: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200" },
    waterlogging:  { text: "text-red-600",    bg: "bg-red-50",    border: "border-red-200"   },
    pump_failure:  { text: "text-red-600",    bg: "bg-red-50",    border: "border-red-200"   },
    road_damage:   { text: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200" },
  }[report.issue_type] || { text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" }

  const isPending = report.status === "pending"

  return (
    <div className="flex items-start gap-3 py-3 px-4 border-b border-slate-100 hover:bg-slate-50 transition-colors duration-150">
      <div className="mt-1.5 flex-shrink-0">
        <div className={`w-2 h-2 rounded-full ${isPending ? "bg-amber-400" : "bg-emerald-500"}`}>
          {isPending && <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping opacity-60 absolute" />}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-slate-800 capitalize">
            {report.issue_type?.replace("_", " ") || "Issue"}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border capitalize ${typeColor.text} ${typeColor.bg} ${typeColor.border}`}>
            {report.issue_type}
          </span>
        </div>
        <div className="text-xs mt-0.5 text-slate-400 truncate">
          {report.description || "No description"}
        </div>
        <div className="flex gap-3 mt-1">
          {report.ward_id && (
            <span className="text-[10px] font-mono text-slate-400">Ward {report.ward_id}</span>
          )}
          {report.reported_at && (
            <span className="text-[10px] font-mono text-slate-400">
              {new Date(report.reported_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
      </div>
      <span className={`flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full font-semibold border capitalize ${
        isPending
          ? "text-amber-600 bg-amber-50 border-amber-200"
          : "text-emerald-600 bg-emerald-50 border-emerald-200"
      }`}>
        {report.status}
      </span>
    </div>
  )
}

function ResourceRow({ req }) {
  const isPending = req.status === "pending"
  return (
    <div className="flex items-center gap-3 py-3 px-4 border-b border-slate-100 hover:bg-slate-50 transition-colors duration-150">
      <div className="flex-1">
        <div className="text-sm font-semibold text-slate-800">
          {req.resource_type} <span className="text-slate-400">×</span> {req.quantity}
        </div>
        <div className="text-xs mt-0.5 text-slate-400">
          {req.reason || "No reason given"} · <span className="font-mono">Ward {req.ward_id}</span>
        </div>
      </div>
      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border capitalize ${
        isPending
          ? "text-amber-600 bg-amber-50 border-amber-200"
          : "text-emerald-600 bg-emerald-50 border-emerald-200"
      }`}>
        {req.status}
      </span>
    </div>
  )
}

export default function CommandCenter() {
  const [overview, setOverview] = useState(null)
  const [command, setCommand] = useState(null)
  const [reports, setReports] = useState([])
  const [resources, setResources] = useState([])
  const [readiness, setReadiness] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const loadAll = () => {
    Promise.all([
      api.get("/admin/system-overview").catch(() => null),
      api.get("/command/live-command-center").catch(() => null),
      api.get("/engineer").then(r => r.data.engineers || []).catch(() => []),
      api.get("/readiness/ward-readiness").catch(() => null)
    ]).then(([ov, cmd, engList, rd]) => {
      if (ov) setOverview(ov.data)
      if (cmd) setCommand(cmd.data)
      const allReports = []
      const allResources = []
      engList.forEach(e => {
        if (e.reports) allReports.push(...e.reports)
        if (e.resource_requests) allResources.push(...e.resource_requests)
      })
      if (rd) setReadiness(rd.data || [])
      setLastRefresh(new Date())
    }).finally(() => setLoading(false))

    api.get("/engineer").then(r => {
      const wards = [...new Set((r.data.engineers || []).map(e => e.ward_id).filter(Boolean))]
      return Promise.all(wards.slice(0, 5).map(wid => api.get(`/engineer/reports/${wid}`).catch(() => null)))
    }).then(results => {
      const all = []
      results.forEach(r => { if (r?.data?.reports) all.push(...r.data.reports) })
      if (all.length > 0) setReports(all)
    }).catch(() => {})

    api.get("/engineer").then(r => {
      const wards = [...new Set((r.data.engineers || []).map(e => e.ward_id).filter(Boolean))]
      return Promise.all(wards.slice(0, 5).map(wid => api.get(`/engineer/resource-requests/${wid}`).catch(() => null)))
    }).then(results => {
      const all = []
      results.forEach(r => { if (r?.data?.requests) all.push(...r.data.requests) })
      if (all.length > 0) setResources(all)
    }).catch(() => {})
  }

  useEffect(() => { loadAll() }, [])

  const criticalWards = readiness.filter(w => w.status === "CRITICAL").length
  const highRiskWards = readiness.filter(w => w.status === "HIGH RISK").length

  return (
    <div className="w-full bg-slate-50 px-6 py-6 font-sans">

      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
            Live System Status
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Command Center
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-50" />
            </div>
            <span className="text-xs font-medium text-slate-600">System Live</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock size={12} />
            <span className="font-mono">{lastRefresh.toLocaleTimeString()}</span>
          </div>
          <button
            onClick={loadAll}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-full hover:bg-blue-600 transition-colors duration-200 shadow-sm"
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Metric cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <MetricCard
              label="Pumps"
              value={overview?.pumps?.total ?? command?.pumps?.total}
              sub={`${overview?.pumps?.deployed ?? command?.pumps?.deployed ?? 0} deployed`}
              color="#2563eb"
              icon={Cpu}
              delay={0}
            />
            <MetricCard
              label="Engineers"
              value={overview?.engineers?.total}
              sub={`${overview?.engineers?.active ?? 0} active`}
              color="#059669"
              icon={Activity}
              delay={60}
            />
            <MetricCard
              label="Flood Hotspots"
              value={overview?.flood_status?.hotspots ?? command?.flood_hotspots}
              sub="HIGH risk grids"
              color="#dc2626"
              icon={Waves}
              delay={120}
            />
            <MetricCard
              label="Critical Wards"
              value={overview?.flood_status?.critical_wards ?? criticalWards}
              sub={`${highRiskWards} high risk`}
              color="#d97706"
              icon={AlertTriangle}
              delay={180}
            />
          </div>

          {/* Pump fleet breakdown */}
          {overview?.pumps && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-5 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-4">
                Pump Fleet Status
              </p>
              <div className="flex gap-5">
                {[
                  { label: "Available", value: overview.pumps.available, color: "#059669", track: "bg-emerald-100" },
                  { label: "Allocated", value: overview.pumps.allocated, color: "#d97706", track: "bg-amber-100"   },
                  { label: "Deployed",  value: overview.pumps.deployed,  color: "#dc2626", track: "bg-red-100"     }
                ].map(({ label, value, color, track }) => {
                  const pct = overview.pumps.total ? (value / overview.pumps.total) * 100 : 0
                  return (
                    <div key={label} className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-600">{label}</span>
                        <span className="text-xs font-bold font-mono" style={{ color }}>{value}</span>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${track}`}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Issues + Resources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">Issues Reported</span>
                {command?.issues_reported != null && (
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
                    {command.issues_reported} total
                  </span>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {reports.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-400">No issues logged</div>
                ) : (
                  reports.slice(0, 15).map((r, i) => <IssueRow key={i} report={r} />)
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-900">Resource Requests</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {resources.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-400">No pending requests</div>
                ) : (
                  resources.slice(0, 15).map((r, i) => <ResourceRow key={i} req={r} />)
                )}
              </div>
            </div>
          </div>

          {/* Ward readiness table */}
          {readiness.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-900">Ward Readiness Summary</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {["Ward", "Avg Risk", "Flooded", "Score", "Status"].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...readiness]
                      .sort((a, b) => a.readiness_score - b.readiness_score)
                      .slice(0, 20)
                      .map(w => {
                        const { text, bg, border } =
                          w.status === "CRITICAL"  ? { text: "text-red-600",    bg: "bg-red-50",    border: "border-red-200"    } :
                          w.status === "HIGH RISK" ? { text: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200"  } :
                          w.status === "MODERATE"  ? { text: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200"   } :
                                                     { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" }
                        const barColor =
                          w.status === "CRITICAL"  ? "#dc2626" :
                          w.status === "HIGH RISK" ? "#d97706" :
                          w.status === "MODERATE"  ? "#2563eb" : "#059669"
                        return (
                          <tr key={w.ward_id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-2.5 text-sm font-mono font-medium text-slate-800">Ward {w.ward_id}</td>
                            <td className="px-4 py-2.5 text-sm font-mono text-slate-600">{w.avg_risk}</td>
                            <td className="px-4 py-2.5 text-sm font-mono">
                              <span className={w.flooded_grids > 0 ? "text-red-600 font-semibold" : "text-slate-400"}>
                                {w.flooded_grids}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden" style={{ width: 60 }}>
                                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${w.readiness_score}%`, backgroundColor: barColor }} />
                                </div>
                                <span className="text-xs font-mono font-bold" style={{ color: barColor }}>{w.readiness_score}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${text} ${bg} ${border}`}>
                                {w.status}
                              </span>
                            </td>
                          </tr>
                        )
                      })
                    }
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