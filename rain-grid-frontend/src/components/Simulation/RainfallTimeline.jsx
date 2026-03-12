import { useState } from "react"

const HOURS = ["18:00","20:00","22:00","00:00","02:00","04:00","06:00"]

export default function RainfallTimeline() {
  const [hour, setHour] = useState(12)
  const [playing, setPlaying] = useState(false)

  return (
    <div
      className="flex-shrink-0 px-6 py-3"
      style={{
        background: "rgba(9,21,42,0.97)",
        borderTop: "1px solid var(--border)",
        height: 72
      }}
    >
      <div className="flex items-center gap-4">

        <div className="flex-shrink-0">
          <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--text-3)", fontFamily: "DM Mono, monospace" }}>
            Timeline
          </div>
          <div className="flex items-center gap-1.5">
            {[
              { label: "▶", active: playing, action: () => setPlaying(true) },
              { label: "⏸", active: !playing, action: () => setPlaying(false) }
            ].map(({ label, active, action }) => (
              <button
                key={label}
                onClick={action}
                className="w-6 h-6 rounded text-[10px] flex items-center justify-center transition"
                style={{
                  background: active ? "var(--accent-dim)" : "var(--bg-elevated)",
                  color: active ? "var(--accent)" : "var(--text-3)",
                  border: `1px solid ${active ? "var(--border-md)" : "var(--border)"}`
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div className="relative">
            <div
              className="h-1.5 w-full rounded-full overflow-hidden"
              style={{ background: "var(--bg-elevated)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(hour / 24) * 100}%`,
                  background: "linear-gradient(90deg, #0ea5e9, #38bdf8, #f59e0b)",
                  boxShadow: "0 0 6px rgba(56,189,248,0.5)",
                  transition: "width 0.1s"
                }}
              />
            </div>
            <input
              type="range" min="0" max="24" value={hour}
              onChange={e => setHour(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
            />
          </div>
          <div className="flex justify-between mt-1.5">
            {HOURS.map((h, i) => (
              <span
                key={i}
                className="text-[9px]"
                style={{
                  color: i === 2 ? "var(--accent)" : "var(--text-3)",
                  fontFamily: "DM Mono, monospace",
                  fontWeight: i === 2 ? 600 : 400
                }}
              >
                {h}
              </span>
            ))}
          </div>
        </div>

        <div className="flex-shrink-0 text-right">
          <div className="text-[10px]" style={{ color: "var(--text-3)", fontFamily: "DM Mono, monospace" }}>
            T+{hour}h
          </div>
        </div>

      </div>
    </div>
  )
}