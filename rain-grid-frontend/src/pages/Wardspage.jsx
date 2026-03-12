// import { useEffect, useState } from "react"
// import { api } from "../api/api"
// import { X, ArrowUpDown } from "lucide-react"

// const STATUS_MAP = {
//   CRITICAL:    { text: "text-red-600",    bg: "bg-red-50",    border: "border-red-200",    bar: "#dc2626", rank: 0 },
//   "HIGH RISK": { text: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200",  bar: "#d97706", rank: 1 },
//   MODERATE:    { text: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200",   bar: "#2563eb", rank: 2 },
//   READY:       { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", bar: "#059669", rank: 3 }
// }

// function ReadinessBar({ score }) {
//   const barColor =
//     score < 40 ? "#dc2626" :
//     score < 60 ? "#d97706" :
//     score < 80 ? "#2563eb" : "#059669"

//   const textClass =
//     score < 40 ? "text-red-600" :
//     score < 60 ? "text-amber-600" :
//     score < 80 ? "text-blue-600" : "text-emerald-600"

//   const trackClass =
//     score < 40 ? "bg-red-100" :
//     score < 60 ? "bg-amber-100" :
//     score < 80 ? "bg-blue-100" : "bg-emerald-100"

//   return (
//     <div className="mt-2">
//       <div className="flex items-center justify-between mb-1">
//         <span className="text-[9px] font-semibold uppercase tracking-widest text-slate-400">Readiness</span>
//         <span className={`text-[11px] font-bold font-mono ${textClass}`}>{score}</span>
//       </div>
//       <div className={`h-1.5 rounded-full overflow-hidden ${trackClass}`}>
//         <div
//           className="h-full rounded-full transition-all duration-700"
//           style={{ width: `${score}%`, backgroundColor: barColor }}
//         />
//       </div>
//     </div>
//   )
// }

// function WardCard({ ward, onViewDetails }) {
//   const s = STATUS_MAP[ward.status] || STATUS_MAP.READY

//   return (
//     <div
//       className={`rounded-2xl p-4 cursor-pointer border transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md ${s.bg} ${s.border}`}
//       onClick={() => onViewDetails(ward)}
//     >
//       <div className="flex items-start justify-between mb-3">
//         <div>
//           <div className="text-sm font-bold text-slate-900 tracking-tight">Ward {ward.ward_id}</div>
//           <div className="text-[10px] text-slate-400 font-mono mt-0.5">{ward.total_grids} grids</div>
//         </div>
//         <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border ${s.text} ${s.bg} ${s.border}`}>
//           {ward.status}
//         </span>
//       </div>

//       <div className="grid grid-cols-2 gap-2 mb-1">
//         <div>
//           <div className="text-[9px] font-semibold uppercase tracking-widest text-slate-400">Avg Risk</div>
//           <div className="text-xs text-slate-700 font-mono mt-0.5">{ward.avg_risk}</div>
//         </div>
//         <div>
//           <div className="text-[9px] font-semibold uppercase tracking-widest text-slate-400">Flooded</div>
//           <div className={`text-xs font-mono mt-0.5 font-semibold ${ward.flooded_grids > 0 ? "text-red-600" : "text-emerald-600"}`}>
//             {ward.flooded_grids} grids
//           </div>
//         </div>
//       </div>

//       <ReadinessBar score={ward.readiness_score} />
//     </div>
//   )
// }

// function WardDetailPanel({ ward, pumps, engineers, onClose }) {
//   const wardPumps = pumps.filter(p => p.ward_id === ward.ward_id)
//   const wardEngineers = engineers.filter(e => e.ward_id === ward.ward_id)
//   const s = STATUS_MAP[ward.status] || STATUS_MAP.READY

//   return (
//     <div
//       className="fixed inset-0 z-[9999] flex items-center justify-center"
//       style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(8px)" }}
//       onClick={onClose}
//     >
//       <div
//         className={`bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border ${s.border}`}
//         style={{ maxHeight: "80vh", overflow: "auto" }}
//         onClick={e => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between mb-4">
//           <div>
//             <p className={`text-[10px] font-semibold uppercase tracking-widest mb-0.5 ${s.text}`}>Ward Dashboard</p>
//             <h2 className="text-xl font-bold text-slate-900 tracking-tight">Ward {ward.ward_id}</h2>
//           </div>
//           <button
//             onClick={onClose}
//             className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
//           >
//             <X size={15} className="text-slate-500" />
//           </button>
//         </div>

//         <ReadinessBar score={ward.readiness_score} />

//         {/* Key stats */}
//         <div className="grid grid-cols-3 gap-3 mt-4">
//           {[
//             { label: "Status",        value: ward.status,        colorClass: s.text          },
//             { label: "Avg Risk",      value: ward.avg_risk,      colorClass: "text-amber-600" },
//             { label: "Flooded Grids", value: ward.flooded_grids, colorClass: "text-red-600"  }
//           ].map(({ label, value, colorClass }) => (
//             <div key={label} className="rounded-xl p-3 text-center bg-slate-50 border border-slate-200">
//               <div className={`text-base font-bold tracking-tight ${colorClass}`}>{value}</div>
//               <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-400 mt-1">{label}</div>
//             </div>
//           ))}
//         </div>

//         {/* Engineers + Pumps */}
//         <div className="mt-4 grid grid-cols-2 gap-4">
//           <div>
//             <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
//               Engineers ({wardEngineers.length})
//             </p>
//             {wardEngineers.length === 0 ? (
//               <div className="text-xs text-slate-400">None assigned</div>
//             ) : wardEngineers.map(e => (
//               <div key={e.engineer_id} className="flex items-center justify-between py-1.5 border-b border-slate-100">
//                 <span className="text-xs font-semibold text-slate-800">{e.engineer_name}</span>
//                 <span className="text-[10px] font-mono text-slate-400">{e.phone}</span>
//               </div>
//             ))}
//           </div>

//           <div>
//             <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
//               Pumps ({wardPumps.length})
//             </p>
//             {wardPumps.length === 0 ? (
//               <div className="text-xs text-slate-400">None allocated</div>
//             ) : wardPumps.map(p => (
//               <div key={p.pump_id} className="flex items-center justify-between py-1.5 border-b border-slate-100">
//                 <span className="text-xs font-mono font-medium text-slate-800">{p.pump_id}</span>
//                 <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
//                   p.status === "deployed"  ? "text-red-600 bg-red-50 border-red-200"         :
//                   p.status === "allocated" ? "text-amber-600 bg-amber-50 border-amber-200"   :
//                                              "text-emerald-600 bg-emerald-50 border-emerald-200"
//                 }`}>
//                   {p.status}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// const STATUS_ORDER = ["CRITICAL", "HIGH RISK", "MODERATE", "READY"]

// export default function WardsPage() {
//   const [wards, setWards] = useState([])
//   const [pumps, setPumps] = useState([])
//   const [engineers, setEngineers] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [statusFilter, setStatusFilter] = useState("all")
//   const [selectedWard, setSelectedWard] = useState(null)
//   const [sortBy, setSortBy] = useState("status")

//   useEffect(() => {
//     Promise.all([
//       api.get("/readiness/ward-readiness"),
//       api.get("/pumps"),
//       api.get("/engineer")
//     ]).then(([rr, pr, er]) => {
//       setWards(rr.data || [])
//       setPumps(pr.data.pumps || [])
//       setEngineers(er.data.engineers || [])
//     }).catch(() => {}).finally(() => setLoading(false))
//   }, [])

//   const summary = {
//     total:    wards.length,
//     critical: wards.filter(w => w.status === "CRITICAL").length,
//     highRisk: wards.filter(w => w.status === "HIGH RISK").length,
//     ready:    wards.filter(w => w.status === "READY").length
//   }

//   let filtered = wards.filter(w => statusFilter === "all" || w.status === statusFilter)

//   if (sortBy === "status")      filtered = [...filtered].sort((a, b) => (STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)))
//   else if (sortBy === "score_asc")  filtered = [...filtered].sort((a, b) => a.readiness_score - b.readiness_score)
//   else                              filtered = [...filtered].sort((a, b) => b.readiness_score - a.readiness_score)

//   return (
//     <div className="min-h-full bg-slate-50 px-6 py-6 font-sans">

//       {/* Header */}
//       <div className="mb-6">
//         <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
//           Flood Response · Territory
//         </p>
//         <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ward Readiness</h1>
//       </div>

//       {/* Summary cards */}
//       <div className="flex gap-3 mb-6 flex-wrap">
//         {[
//           { label: "Total Wards", value: summary.total,    color: "#0f172a"  },
//           { label: "Critical",    value: summary.critical, color: "#dc2626"  },
//           { label: "High Risk",   value: summary.highRisk, color: "#d97706"  },
//           { label: "Ready",       value: summary.ready,    color: "#059669"  }
//         ].map(({ label, value, color }) => (
//           <div
//             key={label}
//             className="flex-1 min-w-28 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm"
//           >
//             <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">{label}</div>
//             <div className="text-4xl font-bold tracking-tighter" style={{ color }}>{value}</div>
//           </div>
//         ))}
//       </div>

//       {/* Toolbar */}
//       <div className="flex items-center gap-3 mb-5 flex-wrap">
//         <div className="flex gap-1.5">
//           {["all", ...STATUS_ORDER].map(s => (
//             <button
//               key={s}
//               onClick={() => setStatusFilter(s)}
//               className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors border ${
//                 statusFilter === s
//                   ? "bg-slate-900 text-white border-slate-900"
//                   : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
//               }`}
//             >
//               {s === "all" ? "All" : s}
//             </button>
//           ))}
//         </div>

//         <div className="ml-auto flex items-center gap-1.5">
//           <ArrowUpDown size={13} className="text-slate-400" />
//           {[
//             { key: "status",     label: "By Risk"  },
//             { key: "score_asc",  label: "Score ↑"  },
//             { key: "score_desc", label: "Score ↓"  }
//           ].map(({ key, label }) => (
//             <button
//               key={key}
//               onClick={() => setSortBy(key)}
//               className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
//                 sortBy === key
//                   ? "bg-slate-900 text-white border-slate-900"
//                   : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
//               }`}
//             >
//               {label}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Grid */}
//       {loading ? (
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
//           {Array.from({ length: 10 }).map((_, i) => (
//             <div key={i} className="h-36 rounded-2xl bg-slate-200 animate-pulse" />
//           ))}
//         </div>
//       ) : (
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
//           {filtered.map((ward, i) => (
//             <div key={ward.ward_id} style={{ animationDelay: `${i * 25}ms` }}>
//               <WardCard ward={ward} onViewDetails={setSelectedWard} />
//             </div>
//           ))}
//         </div>
//       )}

//       {selectedWard && (
//         <WardDetailPanel
//           ward={selectedWard}
//           pumps={pumps}
//           engineers={engineers}
//           onClose={() => setSelectedWard(null)}
//         />
//       )}
//     </div>
//   )
// }




















import { useEffect, useState, useCallback } from "react"
import { api } from "../api/api"
import { X, ArrowUpDown, RefreshCw } from "lucide-react"

const STATUS_MAP = {
  CRITICAL:    { text: "text-red-600",     bg: "bg-red-50",     border: "border-red-200",    bar: "#dc2626", rank: 0 },
  "HIGH RISK": { text: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200",  bar: "#d97706", rank: 1 },
  MODERATE:    { text: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-200",   bar: "#2563eb", rank: 2 },
  READY:       { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", bar: "#059669", rank: 3 }
}

const STATUS_ORDER = ["CRITICAL", "HIGH RISK", "MODERATE", "READY"]

// ─── READINESS BAR ────────────────────────────────────────────────────────────
function ReadinessBar({ score }) {
  const barColor   = score < 40 ? "#dc2626" : score < 60 ? "#d97706" : score < 80 ? "#2563eb" : "#059669"
  const textClass  = score < 40 ? "text-red-600" : score < 60 ? "text-amber-600" : score < 80 ? "text-blue-600" : "text-emerald-600"
  const trackClass = score < 40 ? "bg-red-100"   : score < 60 ? "bg-amber-100"   : score < 80 ? "bg-blue-100"   : "bg-emerald-100"
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] font-semibold uppercase tracking-widest text-slate-400">Readiness</span>
        <span className={`text-[11px] font-bold font-mono ${textClass}`}>{score}</span>
      </div>
      <div className={`h-1.5 rounded-full overflow-hidden ${trackClass}`}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: barColor }} />
      </div>
    </div>
  )
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusDot({ status }) {
  const map = {
    active:    "text-emerald-600 bg-emerald-50 border-emerald-200",
    on_site:   "text-emerald-600 bg-emerald-50 border-emerald-200",
    deployed:  "text-blue-600   bg-blue-50    border-blue-200",
    idle:      "text-amber-600  bg-amber-50   border-amber-200",
    offline:   "text-red-600    bg-red-50     border-red-200",
    available: "text-emerald-600 bg-emerald-50 border-emerald-200",
    allocated: "text-amber-600  bg-amber-50   border-amber-200",
    pending:   "text-amber-600  bg-amber-50   border-amber-200",
    resolved:  "text-emerald-600 bg-emerald-50 border-emerald-200",
  }
  const dotMap = {
    active: "#059669", on_site: "#059669", deployed: "#2563eb",
    idle: "#d97706", offline: "#dc2626", available: "#059669",
    allocated: "#d97706", pending: "#d97706", resolved: "#059669"
  }
  const cls   = map[status]    || "text-slate-500 bg-slate-50 border-slate-200"
  const color = dotMap[status] || "#94a3b8"
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      {status?.replace(/_/g, " ") || "—"}
    </span>
  )
}

// ─── WARD CARD ────────────────────────────────────────────────────────────────
function WardCard({ ward, onViewDetails }) {
  const s = STATUS_MAP[ward.status] || STATUS_MAP.READY
  return (
    <div
      className={`rounded-2xl p-4 cursor-pointer border transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md ${s.bg} ${s.border}`}
      onClick={() => onViewDetails(ward)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-sm font-bold text-slate-900 tracking-tight">Ward {ward.ward_id}</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{ward.total_grids} grids</div>
        </div>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border ${s.text} ${s.bg} ${s.border}`}>
          {ward.status}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-1">
        <div>
          <div className="text-[9px] font-semibold uppercase tracking-widest text-slate-400">Avg Risk</div>
          <div className="text-xs text-slate-700 font-mono mt-0.5">{ward.avg_risk}</div>
        </div>
        <div>
          <div className="text-[9px] font-semibold uppercase tracking-widest text-slate-400">Flooded</div>
          <div className={`text-xs font-mono mt-0.5 font-semibold ${ward.flooded_grids > 0 ? "text-red-600" : "text-emerald-600"}`}>
            {ward.flooded_grids} grids
          </div>
        </div>
      </div>
      <ReadinessBar score={ward.readiness_score} />
    </div>
  )
}

// ─── SECTION BLOCK (inside modal) ────────────────────────────────────────────
function SectionBlock({ title, count, countAlert, children, emptyMsg }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          {title} {count != null && `(${count})`}
        </span>
        {countAlert && count > 0 && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
            {count} open
          </span>
        )}
      </div>
      {count === 0
        ? <div className="px-4 py-4 text-xs text-slate-400">{emptyMsg}</div>
        : children
      }
    </div>
  )
}

// ─── WARD DETAIL PANEL (modal) ────────────────────────────────────────────────
function WardDetailPanel({ ward, onClose }) {
  const s = STATUS_MAP[ward.status] || STATUS_MAP.READY
  const [dashData, setDashData] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const load = useCallback(() => {
    setLoading(true); setError(null)
    api.get(`/ward/${ward.ward_id}/dashboard`)
      .then(r => setDashData(r.data))
      .catch(() => setError("Could not load ward details"))
      .finally(() => setLoading(false))
  }, [ward.ward_id])

  useEffect(() => { load() }, [load])

  const d = dashData || {}

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl w-full max-w-2xl shadow-2xl border flex flex-col ${s.border}`}
        style={{ maxHeight: "88vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 flex-shrink-0 border-b border-slate-100">
          <div>
            <p className={`text-[10px] font-semibold uppercase tracking-widest mb-0.5 ${s.text}`}>Ward Dashboard</p>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Ward {ward.ward_id}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors" title="Refresh">
              <RefreshCw size={13} className="text-slate-500" />
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
              <X size={15} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-6 py-5 flex-1">

          <ReadinessBar score={ward.readiness_score} />

          {/* Readiness key stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: "Status",        value: ward.status,        colorClass: s.text           },
              { label: "Avg Risk",      value: ward.avg_risk,      colorClass: "text-amber-600" },
              { label: "Flooded Grids", value: ward.flooded_grids, colorClass: "text-red-600"   }
            ].map(({ label, value, colorClass }) => (
              <div key={label} className="rounded-xl p-3 text-center bg-slate-50 border border-slate-200">
                <div className={`text-base font-bold tracking-tight ${colorClass}`}>{value}</div>
                <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-400 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Live dashboard stat bar */}
          {(loading || dashData) && (
            <div className="grid grid-cols-5 gap-2 mt-3">
              {[
                { label: "Engineers",  value: d.engineers?.length,         alert: false },
                { label: "Pumps",      value: d.pumps?.length,             alert: false },
                { label: "Issues",     value: d.issues?.length,            alert: d.issues?.length > 0 },
                { label: "Requests",   value: d.resource_requests?.length, alert: d.resource_requests?.length > 0 },
                { label: "Hotspots",   value: d.flood_hotspots?.length,    alert: d.flood_hotspots?.length > 0 }
              ].map(({ label, value, alert }) => (
                <div key={label} className="rounded-xl p-2.5 text-center bg-slate-50 border border-slate-200">
                  {loading
                    ? <div className="h-5 rounded bg-slate-200 animate-pulse mb-1" />
                    : <div className={`text-lg font-bold tracking-tight ${alert ? "text-red-600" : "text-slate-800"}`}>{value ?? "—"}</div>
                  }
                  <div className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl p-3 bg-red-50 border border-red-200 text-xs text-red-600 font-medium">⚠️ {error}</div>
          )}

          {loading && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />)}
            </div>
          )}

          {!loading && dashData && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">

              {/* Engineers */}
              <SectionBlock title="Field Engineers" count={d.engineers?.length} emptyMsg="None assigned">
                {d.engineers?.map(e => (
                  <div key={e.engineer_id} className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="text-xs font-semibold text-slate-800">{e.engineer_name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{e.phone}</div>
                    </div>
                    <StatusDot status={e.status || "active"} />
                  </div>
                ))}
              </SectionBlock>

              {/* Pumps */}
              <SectionBlock title="Pumps" count={d.pumps?.length} emptyMsg="None allocated">
                {d.pumps?.map(p => (
                  <div key={p.pump_id} className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="text-xs font-mono font-semibold text-slate-800">{p.pump_id}</div>
                      <div className="text-[10px] text-slate-400">{p.type} · {p.capacity_lps} LPS</div>
                    </div>
                    <StatusDot status={p.status} />
                  </div>
                ))}
              </SectionBlock>

              {/* Issues */}
              <SectionBlock
                title="Reported Issues"
                count={d.issues?.length}
                countAlert={true}
                emptyMsg="No open issues"
              >
                {d.issues?.map((issue, i) => (
                  <div key={issue.report_id || i} className="px-4 py-2.5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className={`text-xs font-semibold capitalize ${issue.status !== "resolved" ? "text-red-600" : "text-emerald-600"}`}>
                          {issue.issue_type?.replace(/_/g, " ") || "Issue"}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{issue.description}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          Grid {issue.grid_id} · {issue.reported_at?.slice(0, 10)}
                        </div>
                      </div>
                      <StatusDot status={issue.status} />
                    </div>
                  </div>
                ))}
              </SectionBlock>

              {/* Resource Requests */}
              <SectionBlock title="Resource Requests" count={d.resource_requests?.length} emptyMsg="No pending requests">
                {d.resource_requests?.map((req, i) => (
                  <div key={req.request_id || i} className="px-4 py-2.5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-slate-800 capitalize">
                            {req.resource_type?.replace(/_/g, " ")}
                          </span>
                          <span className="text-xs font-bold font-mono text-blue-600">× {req.quantity}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{req.reason}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">{req.requested_at?.slice(0, 10)}</div>
                      </div>
                      <StatusDot status={req.status} />
                    </div>
                  </div>
                ))}
              </SectionBlock>

              {/* Flood Hotspots — full width - FIXED VERSION */}
              {d.flood_hotspots?.length > 0 && (
                <div className="md:col-span-2 bg-white rounded-xl border border-red-200 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-red-100 bg-red-50">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-red-500">
                      Flood Hotspot Grids ({d.flood_hotspots.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 p-4 max-h-48 overflow-y-auto">
                    {d.flood_hotspots.map((hotspot, index) => {
                      // Extract grid_id from properties if it exists
                      const gridId = hotspot.properties?.grid_id ?? 
                                    hotspot.grid_id ?? 
                                    `Hotspot ${index + 1}`;
                      
                      // Get risk level if available
                      const riskLevel = hotspot.properties?.risk_level;
                      const riskClass = riskLevel === 'HIGH' ? 'bg-red-50 text-red-700 border-red-200' :
                                       riskLevel === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                       'bg-blue-50 text-blue-700 border-blue-200';
                      
                      return (
                        <div key={index} className="flex flex-col">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono ${riskClass}`}>
                            Grid {gridId}
                            {riskLevel && <span className="ml-1 text-[8px] uppercase">({riskLevel})</span>}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function WardsPage() {
  const [wards, setWards]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedWard, setSelectedWard] = useState(null)
  const [sortBy, setSortBy]             = useState("status")

  useEffect(() => {
    api.get("/readiness/ward-readiness")
      .then(r => setWards(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const summary = {
    total:    wards.length,
    critical: wards.filter(w => w.status === "CRITICAL").length,
    highRisk: wards.filter(w => w.status === "HIGH RISK").length,
    ready:    wards.filter(w => w.status === "READY").length
  }

  let filtered = wards.filter(w => statusFilter === "all" || w.status === statusFilter)
  if (sortBy === "status")         filtered = [...filtered].sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status))
  else if (sortBy === "score_asc") filtered = [...filtered].sort((a, b) => a.readiness_score - b.readiness_score)
  else                             filtered = [...filtered].sort((a, b) => b.readiness_score - a.readiness_score)

  return (
    <div className="w-full bg-slate-50 px-6 py-6 font-sans">

      <div className="mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Flood Response · Territory</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ward Readiness</h1>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        {[
          { label: "Total Wards", value: summary.total,    color: "#0f172a" },
          { label: "Critical",    value: summary.critical, color: "#dc2626" },
          { label: "High Risk",   value: summary.highRisk, color: "#d97706" },
          { label: "Ready",       value: summary.ready,    color: "#059669" }
        ].map(({ label, value, color }) => (
          <div key={label} className="flex-1 min-w-28 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">{label}</div>
            <div className="text-4xl font-bold tracking-tighter" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex gap-1.5">
          {["all", ...STATUS_ORDER].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors border ${
                statusFilter === s ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <ArrowUpDown size={13} className="text-slate-400" />
          {[
            { key: "status",     label: "By Risk" },
            { key: "score_asc",  label: "Score ↑" },
            { key: "score_desc", label: "Score ↓" }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                sortBy === key ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-36 rounded-2xl bg-slate-200 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((ward, i) => (
            <div key={ward.ward_id} style={{ animationDelay: `${i * 25}ms` }}>
              <WardCard ward={ward} onViewDetails={setSelectedWard} />
            </div>
          ))}
        </div>
      )}

      {selectedWard && (
        <WardDetailPanel ward={selectedWard} onClose={() => setSelectedWard(null)} />
      )}
    </div>
  )
}