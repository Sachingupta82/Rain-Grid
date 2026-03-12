import { useEffect, useState } from "react"
import { CircleMarker, Tooltip } from "react-leaflet"
import { api } from "../../api/api"

export default function PumpsLayer() {
  const [pumps, setPumps] = useState([])

  useEffect(() => {
    api.get("/pumps")
      .then(res => setPumps(res.data.pumps || []))
      .catch(() => setPumps([]))
  }, [])

  if (!pumps.length) return null

  return (
    <>
      {pumps
        .filter(p => p.location_grid)
        .map(pump => {
          const latOffset = (Number(pump.ward_id) || 0) * 0.01
          const lngOffset = (Number(pump.location_grid) || 0) % 100 * 0.01
          const position = [28.6 + latOffset * 0.02, 77.2 + lngOffset * 0.02]
          const isPermanent = pump.type === "permanent"
          const color = isPermanent ? "#38bdf8" : "#34d399"

          return (
            <CircleMarker
              key={pump.pump_id}
              center={position}
              radius={isPermanent ? 6 : 5}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.9, weight: 2 }}
            >
              <Tooltip direction="top" offset={[0, -4]}>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, minWidth: 140 }}>
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, marginBottom: 4, color: "#38bdf8" }}>
                    {isPermanent ? "Permanent" : "Mobile"} Pump · {pump.pump_id}
                  </div>
                  {pump.ward_id && <div>Ward {pump.ward_id}</div>}
                  <div>Capacity: {pump.capacity_lps} LPS</div>
                  <div>Status: {pump.status}</div>
                </div>
              </Tooltip>
            </CircleMarker>
          )
        })}
    </>
  )
}