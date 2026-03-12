import { useMapViewStore } from "../../store/mapViewStore"
import { X } from "lucide-react"

const VIEW_MODES = [
  { key: "risk",     label: "Risk Map" },
  { key: "ward",     label: "Wards"    },
  { key: "drainage", label: "Drainage" }
]

const FILTERS = [
  { key: "showHigh",         label: "High Risk",     color: "#dc2626", bg: "bg-red-50",    border: "border-red-300",    dot: "bg-red-500"    },
  { key: "showMedium",       label: "Medium Risk",   color: "#d97706", bg: "bg-amber-50",  border: "border-amber-300",  dot: "bg-amber-500"  },
  { key: "showLowElevation", label: "Low Elevation", color: "#2563eb", bg: "bg-blue-50",   border: "border-blue-300",   dot: "bg-blue-500"   }
]

export default function MapControls() {
  const { viewMode, setViewMode, filters, toggleFilter, clearFilters } = useMapViewStore()

  const anyFilter = Object.values(filters).some(Boolean)

  return (
    <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">

      {/* View mode pills */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg">
        {VIEW_MODES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setViewMode(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
              viewMode === key
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Filters */}
      {viewMode !== "drainage" && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg flex-wrap">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mr-1">
            Filter
          </span>

          {FILTERS.map(({ key, label, color, bg, border, dot }) => {
            const active = filters[key]
            return (
              <button
                key={key}
                onClick={() => toggleFilter(key)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all duration-150 border ${
                  active
                    ? `${bg} ${border}`
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
                style={{ color: active ? color : undefined }}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${active ? dot : "bg-slate-300"}`} />
                {label}
              </button>
            )
          })}

          {anyFilter && (
            <button
              onClick={clearFilters}
              className="ml-1 flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
            >
              <X size={10} /> Clear
            </button>
          )}
        </div>
      )}

      {/* Legend */}
      {viewMode === "risk" && !anyFilter && (
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg">
          {[
            { color: "#dc2626", bg: "bg-red-500",    label: "High"   },
            { color: "#d97706", bg: "bg-amber-500",  label: "Medium" },
            { color: "#16a34a", bg: "bg-emerald-500", label: "Low"   }
          ].map(({ bg, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-sm ${bg}`} />
              <span className="text-[10px] font-medium text-slate-600">{label}</span>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}