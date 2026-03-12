import { useGridInsightsStore } from "../../store/gridInsightsStore"
import { X, RefreshCw } from "lucide-react"

function RiskBadge({ level }) {
  const cls =
    level === "HIGH"   ? "text-red-600 bg-red-50 border-red-200"       :
    level === "MEDIUM" ? "text-amber-600 bg-amber-50 border-amber-200" :
                         "text-emerald-600 bg-emerald-50 border-emerald-200"
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${cls}`}>
      {level}
    </span>
  )
}

function Section({ title, badge, children, color = "slate" }) {
  const styles = {
    sky:   { bg: "bg-blue-50",    border: "border-blue-200"   },
    green: { bg: "bg-emerald-50", border: "border-emerald-200" },
    amber: { bg: "bg-amber-50",   border: "border-amber-200"  },
    slate: { bg: "bg-slate-50",   border: "border-slate-200"  }
  }[color] || { bg: "bg-slate-50", border: "border-slate-200" }

  return (
    <div className={`rounded-xl overflow-hidden border ${styles.border} ${styles.bg}`}>
      <div className={`flex items-center justify-between px-3 pt-3 pb-2 border-b ${styles.border} bg-white/60`}>
        <span className="text-xs font-bold text-slate-900">{title}</span>
        {badge}
      </div>
      <div className="px-3 pb-3 pt-2">{children}</div>
    </div>
  )
}

function SkeletonBlock({ rows = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded bg-slate-200 animate-pulse"
          style={{ width: `${60 + (i % 3) * 15}%` }}
        />
      ))}
    </div>
  )
}

function DataRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-semibold font-mono text-slate-900">{value}</span>
    </div>
  )
}

export default function GridInsightsPanel() {
  const { selectedGridId, insights, loading, error, clearSelection } = useGridInsightsStore()

  const isOpen = !!(selectedGridId || loading || error)

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 z-[2000] flex justify-end pointer-events-none">
      {/* Dim backdrop */}
      <div
        className="hidden md:block flex-1 pointer-events-auto"
        style={{ background: "rgba(15,23,42,0.4)", backdropFilter: "blur(3px)" }}
        onClick={clearSelection}
      />

      <aside
        className="pointer-events-auto w-full sm:w-[440px] lg:w-[500px] h-full flex flex-col overflow-hidden bg-white border-l border-slate-200 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 flex-shrink-0 border-b border-slate-100 bg-white">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1">
              Grid Intelligence
            </p>
            <div className="text-base font-bold text-slate-900 tracking-tight">
              {loading ? (
                <div className="h-5 w-48 rounded bg-slate-200 animate-pulse" />
              ) : insights ? (
                `Grid ${insights.grid_id} · Ward ${insights.ward_id}${insights.ward_name ? ` – ${insights.ward_name}` : ""}`
              ) : error ? (
                "Error loading data"
              ) : (
                `Grid ${selectedGridId}`
              )}
            </div>
          </div>
          <button
            onClick={clearSelection}
            className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors mt-0.5"
          >
            <X size={14} className="text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">

          {/* LOADING */}
          {loading && (
            <div className="space-y-3">
              <Section title="Terrain & Base Risk"><SkeletonBlock rows={4} /></Section>
              <Section title="Model & Hydrology Signals"><SkeletonBlock rows={3} /></Section>
              <Section title="Causal Chain" color="sky"><SkeletonBlock rows={5} /></Section>
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="rounded-xl p-4 bg-red-50 border border-red-200">
              <div className="text-sm font-bold text-red-700 mb-1">Failed to load insights</div>
              <div className="text-xs text-red-500">{error}</div>
              <button
                className="mt-3 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors font-medium"
                onClick={() => selectedGridId && useGridInsightsStore.getState().selectGrid(selectedGridId)}
              >
                <RefreshCw size={11} /> Retry
              </button>
            </div>
          )}

          {/* DATA */}
          {!loading && !error && insights && (
            <div className="space-y-3">

              {/* Terrain */}
              <Section
                title="Terrain & Base Risk"
                badge={<RiskBadge level={insights.risk?.level || "—"} />}
              >
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {[
                    { label: "Elevation",      value: insights.terrain_factors?.elevation },
                    { label: "Slope",          value: insights.terrain_factors?.slope != null
  ? insights.terrain_factors.slope.toFixed(4)
  : "—" },
                    { label: "Drain Distance", value: insights.terrain_factors?.distance_to_drain != null ? `${insights.terrain_factors.distance_to_drain} m` : "—" },
                    { label: "Soil Type",      value: insights.terrain_factors?.soil_type },
                    { label: "Land Cover",     value: insights.terrain_factors?.land_cover },
                    { label: "Risk Score",     value: insights.risk?.score }
                  ].filter(d => d.value != null).map(({ label, value }) => (
                    <div key={label}>
                      <div className="text-[9px] font-semibold uppercase tracking-widest text-slate-400">{label}</div>
                      <div className="text-xs font-semibold font-mono text-slate-800 mt-0.5">{value}</div>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Hydrology / ML */}
              <Section title="Model & Hydrology Signals" color="slate">
                <div className="space-y-0">
                  {insights.hydrology && Object.entries(insights.hydrology).slice(0, 4).map(([k, v]) => (
                    <DataRow key={k} label={k.replace(/_/g, " ")} value={String(v)} />
                  ))}

                  {insights.ml_prediction && (
                    <DataRow
                      label="Flood Probability"
                      value={
                        <span className={`font-bold ${
                          (insights.ml_prediction.flood_probability || 0) > 0.7 ? "text-red-600" :
                          (insights.ml_prediction.flood_probability || 0) > 0.4 ? "text-amber-600" : "text-emerald-600"
                        }`}>
                          {insights.ml_prediction.flood_probability != null
                            ? `${(insights.ml_prediction.flood_probability * 100).toFixed(1)}%`
                            : insights.ml_prediction.error || "N/A"
                          }
                        </span>
                      }
                    />
                  )}

                  {insights.ml_prediction?.risk_level && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-xs text-slate-500">Risk Level</span>
                      <RiskBadge level={insights.ml_prediction.risk_level} />
                    </div>
                  )}

                  {insights.water_simulation && (
                    <>
                      <DataRow label="Water Simulation" value={`${insights.water_simulation.risk} cluster`} />
                      <DataRow label="Depth" value={`${insights.water_simulation.depth_cm} cm`} />
                    </>
                  )}
                </div>
              </Section>

              {/* Causal Chain */}
              {(insights.causal_chain || insights.ai_causal_chain) && (
                <Section
                  title="Why This Grid Floods"
                  color="sky"
                  badge={
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-blue-600 text-white">
                      Causal chain
                    </span>
                  }
                >
                  <div className="space-y-3 text-xs text-slate-600">

                    {insights.causal_chain?.environmental_causes?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1.5">
                          Environmental factors
                        </p>
                        <ul className="space-y-1">
                          {insights.causal_chain.environmental_causes.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-blue-500 mt-0.5 flex-shrink-0">›</span>
                              <span className="text-slate-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {insights.causal_chain?.event_causes?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1.5">
                          Recent Activities
                        </p>
                        <ul className="space-y-1">
                          {insights.causal_chain.event_causes.slice(0, 4).map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-amber-500 mt-0.5 flex-shrink-0">›</span>
                              <span className="text-slate-700">
                                {item.date && <span className="text-slate-400 mr-1.5">{item.date}</span>}
                                {item.cause}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {insights.ai_causal_chain && (
                      <div className="rounded-xl p-3 bg-white border border-blue-200">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2">
                          AI Commander Summary
                        </p>
                        {["root_causes", "predicted_scenarios", "recommended_actions"].map(key => (
                          Array.isArray(insights.ai_causal_chain[key]) && insights.ai_causal_chain[key].length > 0 && (
                            <div key={key} className="mb-2">
                              <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
                                {key.replace(/_/g, " ")}
                              </p>
                              <ul className="space-y-0.5">
                                {insights.ai_causal_chain[key].map((item, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-blue-500 flex-shrink-0">›</span>
                                    <span className="text-slate-700">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )
                        ))}
                      </div>
                    )}

                  </div>
                </Section>
              )}

              {/* Pump recommendations */}
              {insights.pump_recommendation?.length > 0 && (
                <Section
                  title="Operational Signals"
                  color="green"
                  badge={
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200">
                      Active
                    </span>
                  }
                >
                  <div className="space-y-2">
                    {insights.pump_recommendation.map((pump, i) => (
                      <div
                        key={i}
                        className="rounded-xl p-2.5 bg-white border border-emerald-200"
                      >
                        <div className="text-xs font-bold text-emerald-700 mb-1">Pump #{pump.pump_id}</div>
                        <div className="flex gap-4 text-[11px] text-slate-500">
                          <span className="font-mono">{pump.capacity_lps} LPS</span>
                          <span className="font-mono">{pump.power_kw} kW</span>
                        </div>
                        {pump.reason && (
                          <div className="text-[11px] text-slate-400 mt-1">{pump.reason}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Timeline */}
              {insights.timeline?.length > 0 && (
                <Section title="Event Timeline">
                  <div className="max-h-40 overflow-y-auto space-y-0">
                    {insights.timeline.slice(0, 10).map((e, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                        <span className="text-[10px] font-mono text-slate-400">{e.date}</span>
                        <span className="text-[10px] font-semibold capitalize px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {e.type.replace("_", " ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

            </div>
          )}
        </div>
      </aside>
    </div>
  )
}