import { useEffect, useState } from "react"
import { api } from "../api/api"
import { Search, Plus, UserCheck, Briefcase, MapPin, X } from "lucide-react"

function TaskBadge({ count }) {
  if (!count) return <span className="text-xs text-slate-400">No tasks</span>
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
      count > 2
        ? "text-red-600 bg-red-50 border-red-200"
        : "text-blue-600 bg-blue-50 border-blue-200"
    }`}>
      {count} task{count !== 1 ? "s" : ""}
    </span>
  )
}

function EngineerRow({ engineer, onDelete, onChangeWard }) {
  const [expanded, setExpanded] = useState(false)
  const tasks = engineer.active_tasks || []
  const pendingTasks = tasks.filter(t => t.status === "pending").length
  const isActive = engineer.status === "active"

  return (
    <>
      <tr
        className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors duration-150"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">
              {engineer.engineer_name?.charAt(0) || "E"}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">{engineer.engineer_name}</div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">{engineer.engineer_id}</div>
            </div>
          </div>
        </td>
        <td className="px-4 py-3.5">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-mono">
            Ward {engineer.ward_id || "—"}
          </span>
        </td>
        <td className="px-4 py-3.5 text-xs text-slate-500 font-mono">
          {engineer.phone || "—"}
        </td>
        <td className="px-4 py-3.5">
          <TaskBadge count={pendingTasks} />
        </td>
        <td className="px-4 py-3.5">
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border capitalize ${
            isActive
              ? "text-emerald-600 bg-emerald-50 border-emerald-200"
              : "text-slate-500 bg-slate-50 border-slate-200"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
            {engineer.status || "active"}
          </span>
        </td>
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-2">
            <button
              onClick={e => { e.stopPropagation(); onChangeWard(engineer) }}
              className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              Re-ward
            </button>
            <button
              onClick={e => { e.stopPropagation(); onDelete(engineer.engineer_id) }}
              className="text-[11px] px-3 py-1.5 rounded-lg bg-slate-50 text-slate-500 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
            >
              Remove
            </button>
          </div>
        </td>
      </tr>

      {expanded && tasks.length > 0 && (
        <tr className="bg-slate-50">
          <td colSpan={6} className="px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
              Active Tasks
            </p>
            <div className="flex gap-2 flex-wrap">
              {tasks.slice(0, 6).map((task, i) => (
                <div
                  key={i}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-medium border ${
                    task.status === "completed"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  <span className="font-mono">Pump {task.pump_id}</span>
                  <span className="ml-2 capitalize text-slate-400">{task.status}</span>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function ModalBackdrop({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

function AddModal({ onClose, onDone }) {
  const [form, setForm] = useState({ engineer_id: "", engineer_name: "", ward_id: "", phone: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    if (!form.engineer_id || !form.engineer_name) return
    setLoading(true)
    setError(null)
    try {
      await api.post("/engineer", form)
      onDone()
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to add engineer")
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: "engineer_id",   label: "Engineer ID",   placeholder: "ENG_001" },
    { key: "engineer_name", label: "Full Name",      placeholder: "Rajesh Kumar" },
    { key: "ward_id",       label: "Ward ID",        placeholder: "W-42" },
    { key: "phone",         label: "Phone",          placeholder: "+91 XXXXXXXXXX" }
  ]

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Add Engineer</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <X size={14} className="text-slate-500" />
          </button>
        </div>
        {fields.map(({ key, label, placeholder }) => (
          <div key={key} className="mb-3">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 block mb-1.5">
              {label}
            </label>
            <input
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:bg-white transition-colors"
              placeholder={placeholder}
              value={form[key]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            />
          </div>
        ))}
        {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
        <div className="flex gap-2 mt-5">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Engineer"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </ModalBackdrop>
  )
}

function ChangeWardModal({ engineer, onClose, onDone }) {
  const [wardId, setWardId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    if (!wardId.trim()) return
    setLoading(true)
    setError(null)
    try {
      await api.patch(`/engineer/${engineer.engineer_id}`, { ward_id: wardId })
      onDone()
    } catch (e) {
      setError(e?.response?.data?.message || "Update failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="bg-white rounded-2xl p-6 w-80 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-bold text-slate-900">Change Ward</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <X size={14} className="text-slate-500" />
          </button>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Move <span className="text-blue-600 font-semibold">{engineer.engineer_name}</span> to a new ward
        </p>
        <input
          className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:bg-white transition-colors mb-3"
          placeholder="New Ward ID"
          value={wardId}
          onChange={e => setWardId(e.target.value)}
        />
        {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? "Updating..." : "Confirm"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </ModalBackdrop>
  )
}

export default function EngineersPage() {
  const [engineers, setEngineers] = useState([])
  const [loading, setLoading] = useState(true)
  const [wardFilter, setWardFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [changingWard, setChangingWard] = useState(null)

  const load = () => {
    setLoading(true)
    api.get("/engineer")
      .then(r => setEngineers(r.data.engineers || []))
      .catch(() => setEngineers([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm(`Remove engineer ${id}?`)) return
    try {
      await api.delete(`/engineer/${id}`)
      setEngineers(prev => prev.filter(e => e.engineer_id !== id))
    } catch {}
  }

  const wards = ["all", ...new Set(engineers.map(e => e.ward_id).filter(Boolean))]

  const filtered = engineers.filter(e => {
    const matchWard   = wardFilter === "all" || e.ward_id === wardFilter
    const matchSearch = !search || e.engineer_name?.toLowerCase().includes(search.toLowerCase()) || e.engineer_id?.includes(search)
    return matchWard && matchSearch
  })

  const totalTasks = engineers.reduce((s, e) => s + (e.active_tasks?.filter(t => t.status === "pending")?.length || 0), 0)

  return (
    <div className="min-h-full bg-slate-50 px-6 py-6 font-sans">

      {/* Header */}
      <div className="mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
          Flood Response · Personnel
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Engineers</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Engineers", value: engineers.length,                             color: "#0f172a", icon: UserCheck },
          { label: "Active Tasks",    value: totalTasks,                                   color: "#d97706", icon: Briefcase },
          { label: "Wards Covered",   value: new Set(engineers.map(e => e.ward_id)).size,  color: "#2563eb", icon: MapPin    }
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</span>
              <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                <Icon size={14} className="text-slate-500" />
              </div>
            </div>
            <div className="text-4xl font-bold tracking-tighter" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="rounded-full pl-9 pr-4 py-2 text-sm outline-none border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 transition-colors w-56 shadow-sm"
            placeholder="Search name or ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {wards.slice(0, 8).map(w => (
            <button
              key={w}
              onClick={() => setWardFilter(w)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                wardFilter === w
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              {w === "all" ? "All wards" : `Ward ${w}`}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="ml-auto flex items-center gap-2 px-5 py-2 bg-slate-900 text-white text-sm font-semibold rounded-full hover:bg-blue-600 transition-colors shadow-sm"
        >
          <Plus size={14} /> Add Engineer
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">👷</div>
            <div className="text-sm font-medium text-slate-500">No engineers found</div>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Engineer", "Ward", "Phone", "Tasks", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <EngineerRow
                  key={e.engineer_id}
                  engineer={e}
                  onDelete={handleDelete}
                  onChangeWard={setChangingWard}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAdd && <AddModal onClose={() => setShowAdd(false)} onDone={() => { setShowAdd(false); load() }} />}
      {changingWard && <ChangeWardModal engineer={changingWard} onClose={() => setChangingWard(null)} onDone={() => { setChangingWard(null); load() }} />}
    </div>
  )
}