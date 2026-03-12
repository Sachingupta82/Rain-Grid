import { useEffect, useState } from "react"
import { api } from "../api/api"

// GET /city/root-causes
// Returns: {
//   event_counts: { flood_event, drain_blockage, construction, ... },
//   ai_analysis: {
//     root_causes: [], infrastructure_issues: [],
//     risk_scenarios: [], recommended_actions: []
//   },
//   sampled_grids: number
// }

function AISection({ icon, title, items, color, bg, border }) {
  if (!items?.length) return null
  return (
    <div className="rounded-xl p-4 anim-fade-up" style={{ background: bg, border: `1px solid ${border}` }}>
      <div className="flex items-center gap-2 mb-3">
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", fontFamily: "Bricolage Grotesque, sans-serif" }}>
          {title}
        </span>
        <span className="badge" style={{ background: `${color}22`, color, border: `1px solid ${color}33` }}>
          {items.length}
        </span>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3 anim-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
              style={{ background: `${color}22`, color }}
            >
              {i + 1}
            </div>
            <p style={{ fontSize: 13, color: "var(--text-1)", lineHeight: 1.55, margin: 0 }}>{item}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function EventCountBar({ label, count, maxCount }) {
  const pct = maxCount ? (count / maxCount) * 100 : 0
  const color = label.includes("flood") ? "var(--red)"
    : label.includes("drain") ? "var(--amber)"
    : label.includes("construction") ? "#7C3AED"
    : "var(--accent)"

  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1.5">
        <span style={{ fontSize: 12, color: "var(--text-2)", textTransform: "capitalize", fontFamily: "Instrument Sans, sans-serif" }}>
          {label.replace(/_/g, " ")}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "Fira Code, monospace" }}>{count}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}

export default function CityIntelligencePage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastFetch, setLastFetch] = useState(null)

  const load = () => {
    setLoading(true); setError(null)
    api.get("/city/root-causes")
      .then(r => { setData(r.data); setLastFetch(new Date()) })
      .catch(e => setError(e?.response?.data?.message || "Failed to load city analysis"))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const eventCounts  = data?.event_counts  || {}
  const aiAnalysis   = data?.ai_analysis   || {}
  const maxCount     = Math.max(...Object.values(eventCounts).filter(Number.isFinite), 1)
  const totalEvents  = Object.values(eventCounts).reduce((s, v) => s + (v || 0), 0)

  return (
    <div className="h-full overflow-y-auto px-6 py-6" style={{ background: "var(--bg)" }}>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "Instrument Sans, sans-serif", marginBottom: 2 }}>
            AI Intelligence · Gemini Analysis
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-1)", fontFamily: "Bricolage Grotesque, sans-serif", margin: 0 }}>
            City Root Cause Report
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4, marginBottom: 0 }}>
            Gemini AI analyses {data?.sampled_grids || "—"} grid samples + all event data to identify systemic flood causes and recommend city-level actions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastFetch && (
            <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "Fira Code, monospace" }}>
              Generated: {lastFetch.toLocaleTimeString()}
            </span>
          )}
          <button onClick={load}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition card"
            style={{ color: "var(--accent)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--accent-light)" }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--surface)" }}
          >
            ↻ Re-analyse
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="space-y-3">
            {[100, 80, 90, 70].map((w, i) => (
              <div key={i} className="skeleton h-6 rounded" style={{ width: `${w}%` }} />
            ))}
          </div>
          <div className="lg:col-span-2 space-y-4">
            {[1,2,3,4].map(i => <div key={i} className="skeleton h-32 rounded-xl" />)}
          </div>
        </div>
      )}

      {/* AI generation notice */}
      {loading && (
        <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl anim-fade-in"
          style={{ background: "var(--accent-light)", border: "1px solid rgba(27,98,240,0.15)" }}>
          <div className="w-4 h-4 rounded-full border-2 flex-shrink-0"
            style={{ borderColor: "var(--accent)", borderTopColor: "transparent", animation: "spin .7s linear infinite" }} />
          <span style={{ fontSize: 12, color: "var(--accent)" }}>
            Gemini AI is sampling grids and generating city-wide analysis — this may take 10–20 seconds…
          </span>
        </div>
      )}

      {error && (
        <div className="card p-5" style={{ background: "var(--red-light)", border: "1px solid rgba(229,62,62,0.2)", color: "var(--red)", fontSize: 13 }}>
          ⚠️ {error}
          <button onClick={load} className="ml-4 underline text-xs">Retry</button>
        </div>
      )}

      {!loading && data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* LEFT: Event counts */}
          <div className="space-y-4">

            {/* AI badge */}
            <div className="card p-3 flex items-center gap-3"
              style={{ background: "linear-gradient(135deg, #EBF2FF 0%, #F5F3FF 100%)", borderColor: "rgba(27,98,240,0.2)" }}>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--accent)" }}
              >
                <span style={{ color: "#fff", fontSize: 16 }}>✦</span>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", fontFamily: "Bricolage Grotesque, sans-serif" }}>
                  Powered by Gemini AI
                </div>
                <div style={{ fontSize: 10, color: "var(--text-3)" }}>
                  {data.sampled_grids} grids sampled for analysis
                </div>
              </div>
            </div>

            {/* Event breakdown */}
            <div className="card p-4">
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14, fontFamily: "Instrument Sans, sans-serif" }}>
                Event Breakdown
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-1)", fontFamily: "Bricolage Grotesque, sans-serif", marginBottom: 2, lineHeight: 1 }}>
                {totalEvents}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 14 }}>total city events analysed</div>
              {Object.entries(eventCounts).map(([key, val]) => (
                <EventCountBar key={key} label={key} count={val} maxCount={maxCount} />
              ))}
            </div>

          </div>

          {/* RIGHT: AI analysis sections */}
          <div className="lg:col-span-2 space-y-4">

            <AISection
              icon="🔍"
              title="Root Causes"
              items={aiAnalysis.root_causes}
              color="var(--red)"
              bg="var(--red-light)"
              border="rgba(229,62,62,0.2)"
            />

            <AISection
              icon="🏗️"
              title="Infrastructure Issues"
              items={aiAnalysis.infrastructure_issues}
              color="#7C3AED"
              bg="#F5F3FF"
              border="rgba(124,58,237,0.2)"
            />

            <AISection
              icon="⚡"
              title="Risk Scenarios"
              items={aiAnalysis.risk_scenarios}
              color="var(--amber)"
              bg="var(--amber-light)"
              border="rgba(217,119,6,0.2)"
            />

            <AISection
              icon="✅"
              title="Recommended Actions"
              items={aiAnalysis.recommended_actions}
              color="var(--green)"
              bg="var(--green-light)"
              border="rgba(13,145,103,0.2)"
            />

            {/* Fallback: if AI returned raw text instead of arrays */}
            {!aiAnalysis.root_causes && !aiAnalysis.recommended_actions && (
              <div className="card p-5">
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", fontFamily: "Bricolage Grotesque, sans-serif", marginBottom: 8 }}>
                  AI Analysis
                </div>
                <pre style={{ fontSize: 12, color: "var(--text-2)", whiteSpace: "pre-wrap", fontFamily: "Instrument Sans, sans-serif", lineHeight: 1.6 }}>
                  {typeof data.ai_analysis === "string" ? data.ai_analysis : JSON.stringify(data.ai_analysis, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}