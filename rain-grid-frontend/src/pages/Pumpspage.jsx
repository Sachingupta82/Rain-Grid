import { useEffect, useState } from "react"
import { api } from "../api/api"
import { Search, X, Cpu } from "lucide-react"

const STATUS_CONFIG = {
  available: { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  allocated: { text: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200"   },
  deployed:  { text: "text-red-600",     bg: "bg-red-50",     border: "border-red-200"      }
}

function StatCard({ label, value, color, icon }) {
  return (
    <div className="flex-1 min-w-28 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</span>
        <span className="text-lg leading-none">{icon}</span>
      </div>
      <div className="text-4xl font-bold tracking-tighter" style={{ color }}>{value}</div>
    </div>
  )
}

function PumpCard({ pump, onAllocate, onDelete }) {
  const s = STATUS_CONFIG[pump.status] || STATUS_CONFIG.available

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-sm font-bold text-slate-900 tracking-tight">{pump.pump_id}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{pump.type || "—"}</div>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${s.text} ${s.bg} ${s.border}`}>
          {pump.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        {[
          { label: "Capacity", value: pump.capacity_lps ? `${pump.capacity_lps} LPS` : "—" },
          { label: "Power",    value: pump.power_kw     ? `${pump.power_kw} kW`      : "—" },
          { label: "Ward",     value: pump.ward_id || "Unassigned"                          },
          { label: "Grid",     value: pump.location_grid || "—"                             }
        ].map(({ label, value }) => (
          <div key={label}>
            <div className="text-[9px] font-semibold uppercase tracking-widest text-slate-400">{label}</div>
            <div className="text-xs text-slate-700 mt-0.5 font-mono">{value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {pump.status === "available" && (
          <button
            onClick={() => onAllocate(pump)}
            className="flex-1 py-1.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            Allocate
          </button>
        )}
        <button
          onClick={() => onDelete(pump.pump_id)}
          className="py-1.5 px-3 rounded-full text-[11px] font-medium bg-slate-50 text-slate-500 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  )
}

function AllocateModal({ pump, onClose, onDone }) {
  const [wardId, setWardId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    if (!wardId.trim()) return
    setLoading(true)
    setError(null)
    try {
      await api.post("/pumps/allocate", { pump_id: pump.pump_id, ward_id: wardId })
      onDone()
    } catch (e) {
      setError(e?.response?.data?.message || "Allocation failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-80 shadow-2xl border border-slate-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Allocate Pump</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <X size={14} className="text-slate-500" />
          </button>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Assign <span className="text-blue-600 font-semibold font-mono">{pump.pump_id}</span> to a ward
        </p>
        <input
          className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:bg-white transition-colors mb-3 font-mono"
          placeholder="Ward ID"
          value={wardId}
          onChange={e => setWardId(e.target.value)}
        />
        {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={loading || !wardId.trim()}
            className="flex-1 py-2.5 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-blue-600 transition-colors disabled:opacity-40"
          >
            {loading ? "Allocating..." : "Confirm"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

const STATUS_OPTIONS = ["all", "available", "allocated", "deployed"]

export default function PumpsPage() {
  const [pumps, setPumps] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [allocatingPump, setAllocatingPump] = useState(null)
  const [search, setSearch] = useState("")

  const load = () => {
    setLoading(true)
    api.get("/pumps")
      .then(r => setPumps(r.data.pumps || []))
      .catch(() => setPumps([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm(`Remove pump ${id}?`)) return
    try {
      await api.delete(`/pumps/${id}`)
      setPumps(prev => prev.filter(p => p.pump_id !== id))
    } catch {}
  }

  const filtered = pumps.filter(p => {
    const matchStatus = filter === "all" || p.status === filter
    const matchSearch = !search || p.pump_id?.toString().includes(search) || p.ward_id?.toString().includes(search)
    return matchStatus && matchSearch
  })

  const stats = {
    total:     pumps.length,
    available: pumps.filter(p => p.status === "available").length,
    allocated: pumps.filter(p => p.status === "allocated").length,
    deployed:  pumps.filter(p => p.status === "deployed").length
  }

  return (
    <div className="min-h-full bg-slate-50 px-6 py-6 font-sans">

      {/* Header */}
      <div className="mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
          Flood Response · Equipment
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pump Management</h1>
      </div>

      {/* Stats */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <StatCard label="Total"     value={stats.total}     color="#0f172a" icon="⚙️" />
        <StatCard label="Available" value={stats.available} color="#059669" icon="✅" />
        <StatCard label="Allocated" value={stats.allocated} color="#d97706" icon="📦" />
        <StatCard label="Deployed"  value={stats.deployed}  color="#dc2626" icon="🚀" />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="rounded-full pl-9 pr-4 py-2 text-sm outline-none border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 transition-colors w-56 shadow-sm"
            placeholder="Search pump / ward ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-1.5">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors border ${
                filter === s
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl p-12 text-center bg-white border border-dashed border-slate-300">
          <div className="text-4xl mb-3">⚙️</div>
          <div className="text-sm font-medium text-slate-500">No pumps match your filters</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((pump, i) => (
            <div key={pump.pump_id} style={{ animationDelay: `${i * 30}ms` }}>
              <PumpCard
                pump={pump}
                onAllocate={setAllocatingPump}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}

      {allocatingPump && (
        <AllocateModal
          pump={allocatingPump}
          onClose={() => setAllocatingPump(null)}
          onDone={() => { setAllocatingPump(null); load() }}
        />
      )}
    </div>
  )
}