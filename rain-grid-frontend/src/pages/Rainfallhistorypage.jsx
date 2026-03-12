import { useEffect, useRef, useState } from "react"
import * as echarts from "echarts"

// ─────────────────────────────────────────────────────────────────────────────
// RAINFALL HISTORY API — STATUS: NO BACKEND ENDPOINT EXISTS YET
//
// Your current backend has NO route that returns historical rainfall data.
// Existing routes only use real-time/simulation data from JSON files.
//
// TO WIRE THIS PAGE TO REAL DATA you need to either:
//
// Option A — IMD Open Data (free, government):
//   India Meteorological Department publishes station-wise daily rainfall CSV.
//   URL: https://www.imd.gov.in/pages/rainfall_main.php
//   Build a backend route: GET /history/rainfall?years=5
//   that reads/caches the IMD CSV for Delhi stations and returns the shape below.
//
// Option B — Open-Meteo Historical API (free, no key needed):
//   GET https://archive-api.open-meteo.com/v1/archive
//     ?latitude=28.6139&longitude=77.2090
//     &start_date=2020-01-01&end_date=2024-12-31
//     &daily=precipitation_sum
//   Returns daily precipitation_sum array for Delhi. 100% free, no signup.
//   *** This is the easiest option — just proxy it from your Express backend ***
//
// Option C — Store your own historical data in a JSON file in ../data/
//   and serve it via a new Express route.
//
// EXPECTED DATA SHAPE (what this component consumes):
// {
//   years: [2020, 2021, 2022, 2023, 2024],
//   monthly: {
//     "2020": [12, 8, 14, 22, 68, 152, 289, 241, 132, 45, 18, 9],  // Jan–Dec mm
//     "2021": [...],
//     ...
//   },
//   flood_events: [
//     { date: "2021-08-14", ward_id: "W-12", severity: "HIGH", rainfall_mm: 94 },
//     ...
//   ],
//   annual_totals: { "2020": 1010, "2021": 1124, ... }
// }
// ─────────────────────────────────────────────────────────────────────────────

// ── STATIC MOCK DATA — replace with API call when backend is ready ──────────
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const YEARS  = [2020, 2021, 2022, 2023, 2024]

const MOCK_MONTHLY = {
  2020: [8,  5, 12, 18, 55, 138, 262, 218, 120, 38, 12,  6],
  2021: [10, 7, 14, 22, 70, 158, 295, 248, 138, 42, 16,  8],
  2022: [6,  4, 10, 15, 48, 112, 235, 202, 108, 32, 10,  5],
  2023: [12, 8, 18, 26, 82, 175, 318, 271, 152, 48, 18, 10],
  2024: [9,  6, 15, 20, 65, 145, 278, 234, 128, 40, 14,  7]
}

const MOCK_FLOOD_EVENTS = [
  { date: "2020-07-19", ward_id: "W-102", severity: "HIGH",     rainfall_mm: 88  },
  { date: "2021-08-14", ward_id: "W-215", severity: "SEVERE",   rainfall_mm: 112 },
  { date: "2021-09-03", ward_id: "W-88",  severity: "MODERATE", rainfall_mm: 64  },
  { date: "2022-07-09", ward_id: "W-157", severity: "HIGH",     rainfall_mm: 78  },
  { date: "2023-06-28", ward_id: "W-201", severity: "SEVERE",   rainfall_mm: 138 },
  { date: "2023-07-31", ward_id: "W-45",  severity: "HIGH",     rainfall_mm: 95  },
  { date: "2023-08-10", ward_id: "W-88",  severity: "HIGH",     rainfall_mm: 102 },
  { date: "2024-07-15", ward_id: "W-102", severity: "MODERATE", rainfall_mm: 71  },
  { date: "2024-08-22", ward_id: "W-215", severity: "HIGH",     rainfall_mm: 89  }
]

const ANNUAL_TOTALS = {
  2020: MOCK_MONTHLY[2020].reduce((a,b)=>a+b,0),
  2021: MOCK_MONTHLY[2021].reduce((a,b)=>a+b,0),
  2022: MOCK_MONTHLY[2022].reduce((a,b)=>a+b,0),
  2023: MOCK_MONTHLY[2023].reduce((a,b)=>a+b,0),
  2024: MOCK_MONTHLY[2024].reduce((a,b)=>a+b,0)
}

const YEAR_COLORS = {
  2020: "#1B62F0",
  2021: "#0D9167",
  2022: "#D97706",
  2023: "#E53E3E",
  2024: "#7C3AED"
}

const SEVERITY_STYLE = {
  SEVERE:   { color: "var(--red)",   bg: "var(--red-light)",   border: "rgba(229,62,62,0.2)"  },
  HIGH:     { color: "var(--amber)", bg: "var(--amber-light)", border: "rgba(217,119,6,0.2)"  },
  MODERATE: { color: "var(--accent)",bg: "var(--accent-light)",border: "rgba(27,98,240,0.15)" }
}

// ── Chart component ──────────────────────────────────────────────────────────
function MultiLineChart({ data, activeYears, chartType }) {
  const ref = useRef(null)
  const instance = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    instance.current = echarts.init(ref.current, null, { renderer: "canvas" })
    return () => { instance.current?.dispose() }
  }, [])

  useEffect(() => {
    if (!instance.current) return
    const series = YEARS.filter(y => activeYears.includes(y)).map(year => ({
      name: String(year),
      type: chartType === "bar" ? "bar" : "line",
      data: data[year],
      smooth: true,
      symbol: "circle",
      symbolSize: 7,
      lineStyle: { color: YEAR_COLORS[year], width: 2.5 },
      itemStyle: { color: YEAR_COLORS[year] },
      areaStyle: chartType === "area" ? {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: YEAR_COLORS[year] + "44" },
          { offset: 1, color: YEAR_COLORS[year] + "00" }
        ])
      } : undefined
    }))

    instance.current.setOption({
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: "#FFFFFF",
        borderColor: "#DDE4EF",
        borderWidth: 1,
        textStyle: { color: "#0C1523", fontFamily: "Instrument Sans, sans-serif", fontSize: 12 },
        formatter: (params) => {
          const month = params[0]?.axisValue
          let html = `<div style="font-family:Bricolage Grotesque,sans-serif;font-weight:700;margin-bottom:6px;font-size:13px">${month}</div>`
          params.forEach(p => {
            html += `<div style="display:flex;justify-content:space-between;gap:20px;margin:2px 0">
              <span style="display:flex;align-items:center;gap:6px">
                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color}"></span>
                ${p.seriesName}
              </span>
              <b style="font-family:Fira Code,monospace">${p.value} mm</b>
            </div>`
          })
          return html
        }
      },
      legend: {
        data: YEARS.filter(y => activeYears.includes(y)).map(String),
        top: 0,
        textStyle: { color: "#4A5568", fontFamily: "Instrument Sans, sans-serif", fontSize: 12 },
        icon: "circle"
      },
      grid: { top: 44, bottom: 40, left: 48, right: 24 },
      xAxis: {
        type: "category",
        data: MONTHS,
        axisLine: { lineStyle: { color: "#DDE4EF" } },
        axisTick: { show: false },
        axisLabel: { color: "#8FA3B8", fontFamily: "Instrument Sans, sans-serif", fontSize: 11 }
      },
      yAxis: {
        type: "value",
        name: "mm",
        nameTextStyle: { color: "#8FA3B8", fontSize: 11 },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: "#EEF1F7", type: "dashed" } },
        axisLabel: { color: "#8FA3B8", fontFamily: "Fira Code, monospace", fontSize: 11 }
      },
      series
    }, true)
  }, [data, activeYears, chartType])

  useEffect(() => {
    const ro = new ResizeObserver(() => instance.current?.resize())
    if (ref.current) ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])

  return <div ref={ref} style={{ width: "100%", height: 340 }} />
}

function AnnualBarChart({ totals, activeYears }) {
  const ref = useRef(null)
  const instance = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    instance.current = echarts.init(ref.current, null, { renderer: "canvas" })
    return () => { instance.current?.dispose() }
  }, [])

  useEffect(() => {
    if (!instance.current) return
    const years = YEARS.filter(y => activeYears.includes(y))
    instance.current.setOption({
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: "#FFFFFF",
        borderColor: "#DDE4EF",
        textStyle: { color: "#0C1523", fontFamily: "Instrument Sans, sans-serif", fontSize: 12 },
        formatter: params => `<b style="font-family:Bricolage Grotesque,sans-serif">${params[0].axisValue}</b><br/><span style="font-family:Fira Code,monospace">${params[0].value} mm total</span>`
      },
      grid: { top: 16, bottom: 36, left: 54, right: 16 },
      xAxis: {
        type: "category",
        data: years.map(String),
        axisLine: { lineStyle: { color: "#DDE4EF" } },
        axisTick: { show: false },
        axisLabel: { color: "#8FA3B8", fontFamily: "Fira Code, monospace", fontSize: 11 }
      },
      yAxis: {
        type: "value",
        name: "mm",
        nameTextStyle: { color: "#8FA3B8", fontSize: 11 },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: "#EEF1F7", type: "dashed" } },
        axisLabel: { color: "#8FA3B8", fontFamily: "Fira Code, monospace", fontSize: 11 }
      },
      series: [{
        type: "bar",
        barMaxWidth: 44,
        data: years.map(y => ({
          value: totals[y],
          itemStyle: { color: YEAR_COLORS[y], borderRadius: [6, 6, 0, 0] }
        })),
        label: {
          show: true,
          position: "top",
          color: "#4A5568",
          fontFamily: "Fira Code, monospace",
          fontSize: 11,
          formatter: "{c} mm"
        }
      }]
    }, true)
  }, [totals, activeYears])

  useEffect(() => {
    const ro = new ResizeObserver(() => instance.current?.resize())
    if (ref.current) ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])

  return <div ref={ref} style={{ width: "100%", height: 220 }} />
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function RainfallHistoryPage() {
  const [activeYears, setActiveYears] = useState([...YEARS])
  const [chartType, setChartType]     = useState("area") // area | line | bar
  const [severityFilter, setSeverityFilter] = useState("all")

  const toggleYear = y =>
    setActiveYears(prev =>
      prev.includes(y)
        ? prev.length > 1 ? prev.filter(x => x !== y) : prev
        : [...prev, y].sort()
    )

  const bestYear  = YEARS.reduce((a, b) => ANNUAL_TOTALS[a] >= ANNUAL_TOTALS[b] ? a : b)
  const worstYear = YEARS.reduce((a, b) => ANNUAL_TOTALS[a] <= ANNUAL_TOTALS[b] ? a : b)
  const avgAnnual = Math.round(Object.values(ANNUAL_TOTALS).reduce((a,b)=>a+b,0) / YEARS.length)

  const floodFiltered = MOCK_FLOOD_EVENTS
    .filter(e => severityFilter === "all" || e.severity === severityFilter)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className="h-full overflow-y-auto px-6 py-6" style={{ background: "var(--bg)" }}>

      {/* Header */}
      <div className="mb-5">
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "Instrument Sans, sans-serif", marginBottom: 2 }}>
          Historical Analysis · 2020–2024
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-1)", fontFamily: "Bricolage Grotesque, sans-serif", margin: 0 }}>
          Rainfall History
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4, marginBottom: 0 }}>
          Delhi 5-year monthly rainfall trends and historic flood event log.
        </p>
      </div>

      {/* API notice banner */}
      <div className="card p-4 mb-5 flex items-start gap-3" style={{ background: "#FFFBEB", borderColor: "rgba(217,119,6,0.25)" }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>🔌</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--amber)", fontFamily: "Bricolage Grotesque, sans-serif", marginBottom: 2 }}>
            Currently showing static mock data
          </div>
          <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6 }}>
            No rainfall history API exists in the backend yet. Easiest fix: proxy{" "}
            <code style={{ background: "var(--amber-light)", padding: "1px 5px", borderRadius: 4, fontSize: 11, fontFamily: "Fira Code, monospace" }}>
              archive-api.open-meteo.com
            </code>{" "}
            through Express (free, no API key). See comments inside{" "}
            <code style={{ background: "var(--amber-light)", padding: "1px 5px", borderRadius: 4, fontSize: 11, fontFamily: "Fira Code, monospace" }}>
              RainfallHistoryPage.jsx
            </code>{" "}
            for the exact URL and expected data shape.
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "5-Year Avg",   value: `${avgAnnual} mm`, color: "var(--accent)" },
          { label: "Wettest Year", value: bestYear,           color: "var(--red)"   },
          { label: "Driest Year",  value: worstYear,          color: "var(--green)"  },
          { label: "Flood Events", value: MOCK_FLOOD_EVENTS.length, color: "var(--amber)" }
        ].map(({ label, value, color }, i) => (
          <div key={label} className="card p-4 anim-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
            <div style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, fontFamily: "Instrument Sans, sans-serif" }}>
              {label}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color, fontFamily: "Bricolage Grotesque, sans-serif", lineHeight: 1 }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Multi-line chart card */}
      <div className="card p-5 mb-5">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)", fontFamily: "Bricolage Grotesque, sans-serif" }}>
            Monthly Rainfall (mm) — 5 Year Comparison
          </span>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Year toggles */}
            <div className="flex gap-1 flex-wrap">
              {YEARS.map(y => (
                <button
                  key={y}
                  onClick={() => toggleYear(y)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold transition"
                  style={{
                    background: activeYears.includes(y) ? YEAR_COLORS[y] + "22" : "var(--surface-2)",
                    color: activeYears.includes(y) ? YEAR_COLORS[y] : "var(--text-3)",
                    border: `1.5px solid ${activeYears.includes(y) ? YEAR_COLORS[y] : "var(--border)"}`,
                    fontFamily: "Fira Code, monospace"
                  }}
                >
                  {y}
                </button>
              ))}
            </div>
            {/* Chart type */}
            <div className="flex gap-1">
              {[["area","Area"],["line","Line"],["bar","Bar"]].map(([k,l]) => (
                <button key={k} onClick={() => setChartType(k)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium transition"
                  style={{ background: chartType === k ? "var(--accent)" : "var(--surface-2)", color: chartType === k ? "#fff" : "var(--text-2)", border: `1px solid ${chartType === k ? "var(--accent)" : "var(--border)"}` }}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
        <MultiLineChart data={MOCK_MONTHLY} activeYears={activeYears} chartType={chartType} />
      </div>

      {/* Annual totals bar */}
      <div className="card p-5 mb-5">
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)", fontFamily: "Bricolage Grotesque, sans-serif", marginBottom: 16 }}>
          Annual Rainfall Total (mm)
        </div>
        <AnnualBarChart totals={ANNUAL_TOTALS} activeYears={activeYears} />
      </div>

      {/* Flood events log */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between flex-wrap gap-3" style={{ borderColor: "var(--border)" }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)", fontFamily: "Bricolage Grotesque, sans-serif" }}>
            Historical Flood Events
          </span>
          <div className="flex gap-1">
            {["all","SEVERE","HIGH","MODERATE"].map(s => (
              <button key={s} onClick={() => setSeverityFilter(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize"
                style={{ background: severityFilter === s ? "var(--accent)" : "var(--surface-2)", color: severityFilter === s ? "#fff" : "var(--text-2)", border: `1px solid ${severityFilter === s ? "var(--accent)" : "var(--border)"}` }}>
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
                {["Date", "Ward", "Severity", "Rainfall", "Notes"].map(h => (
                  <th key={h} className="px-5 py-3 text-left" style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "Instrument Sans, sans-serif" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {floodFiltered.map((ev, i) => {
                const s = SEVERITY_STYLE[ev.severity] || SEVERITY_STYLE.MODERATE
                return (
                  <tr key={i} className="data-row anim-fade-up" style={{ borderBottom: "1px solid var(--border)", animationDelay: `${i * 30}ms` }}>
                    <td className="px-5 py-3" style={{ fontSize: 12, fontFamily: "Fira Code, monospace", color: "var(--text-1)", fontWeight: 600 }}>
                      {ev.date}
                    </td>
                    <td className="px-5 py-3">
                      <span style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: 5, padding: "1px 7px", fontSize: 12, fontFamily: "Fira Code, monospace" }}>
                        {ev.ward_id}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                        {ev.severity}
                      </span>
                    </td>
                    <td className="px-5 py-3" style={{ fontSize: 13, fontWeight: 700, color: s.color, fontFamily: "Fira Code, monospace" }}>
                      {ev.rainfall_mm} mm
                    </td>
                    <td className="px-5 py-3" style={{ fontSize: 12, color: "var(--text-3)" }}>
                      Exceeded flood threshold in 24h period
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}