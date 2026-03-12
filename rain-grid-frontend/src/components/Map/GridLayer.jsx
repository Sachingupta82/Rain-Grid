import { useEffect, useState, useMemo, useCallback } from "react"
import { GeoJSON } from "react-leaflet"
import { api } from "../../api/api"
import { useMapViewStore } from "../../store/mapViewStore"
import { useSimulationStore } from "../../store/simulationStore"
import { useGridInsightsStore } from "../../store/gridInsightsStore"
import { useLiveHeatmapStore } from "../../store/liveHeatmapStore"

/* stable ward color map */
const wardColorMap = {}
function getWardColor(wardId) {
  if (!wardColorMap[wardId]) {
    const idx = Object.keys(wardColorMap).length
    wardColorMap[wardId] = `hsl(${(idx * 47) % 360},60%,60%)`
  }
  return wardColorMap[wardId]
}

function getRiskColor(risk) {
  if (risk > 0.7) return "#ef4444"
  if (risk > 0.4) return "#f59e0b"
  return "#22c55e"
}

export default function GridLayer() {
  const [grids, setGrids] = useState(null)
  const { viewMode, filters } = useMapViewStore()
  const simulation = useSimulationStore(s => s.simulationResult)
  const liveHeatmap = useLiveHeatmapStore(s => s.heatmap)

  useEffect(() => {
    api.get("/map/grids").then(res => setGrids(res.data.data)).catch(() => {})
  }, [])

  /* build lookup maps */
  const simMap = useMemo(() => {
    if (!simulation?.simulated_grids) return {}
    return Object.fromEntries(simulation.simulated_grids.map(g => [g.grid_id, g.simulated_risk]))
  }, [simulation])

  const liveMap = useMemo(() => {
    if (!liveHeatmap) return {}
    return Object.fromEntries(liveHeatmap.map(g => [g.grid_id, g.risk_score]))
  }, [liveHeatmap])

  const style = useCallback((feature) => {
    const p = feature.properties
    let risk = simMap[p.grid_id] ?? liveMap[p.grid_id] ?? p.risk_score

    /* FILTER LOGIC – hide by setting opacity to 0 instead of returning null */
    const anyFilterActive = filters.showHigh || filters.showMedium || filters.showLowElevation
    if (anyFilterActive) {
      let show = false
      if (filters.showHigh && risk >= 0.7) show = true
      if (filters.showMedium && risk >= 0.4 && risk < 0.7) show = true
      if (filters.showLowElevation && p.elevation <= 220) show = true
      if (!show) {
        return { fillOpacity: 0, weight: 0, stroke: false }
      }
    }

    if (viewMode === "ward") {
      return {
        fillColor: getWardColor(p.ward_id),
        color: "rgba(255,255,255,0.15)",
        weight: 0.3,
        fillOpacity: 0.55
      }
    }

    return {
      fillColor: getRiskColor(risk),
      color: "rgba(255,255,255,0.1)",
      weight: 0.2,
      fillOpacity: 0.72
    }
  }, [viewMode, filters, simMap, liveMap])

  const onEachFeature = useCallback((feature, layer) => {
    const p = feature.properties
    const simRisk = simMap[p.grid_id]

    layer.bindPopup(`
      <div style="font-family:'DM Sans',sans-serif;min-width:160px">
        <div style="font-family:'Syne',sans-serif;font-size:13px;font-weight:700;margin-bottom:6px;color:#38bdf8">
          Grid ${p.grid_id}
        </div>
        <div style="font-size:11px;color:#7db4d8;margin-bottom:2px">Ward: ${p.ward_name || p.ward_id}</div>
        <div style="font-size:11px;margin-bottom:2px">Base risk: <b>${p.risk_score?.toFixed(2)}</b></div>
        ${simRisk != null ? `<div style="font-size:11px;color:#fbbf24">Simulated: <b>${simRisk.toFixed(2)}</b></div>` : ""}
        <div style="font-size:11px;margin-top:2px">Elevation: ${p.elevation} · Slope: ${p.slope}</div>
        <div style="margin-top:8px;font-size:10px;color:#38bdf8;cursor:pointer">Click grid to open insights →</div>
      </div>
    `)

    layer.on("click", () => {
      useGridInsightsStore.getState().selectGrid(p.grid_id)
    })

    layer.on("mouseover", function() {
      if (p.risk_score > 0) this.setStyle({ weight: 1.5, fillOpacity: 0.9 })
    })
    layer.on("mouseout", function() {
      this.setStyle({ weight: 0.2, fillOpacity: 0.72 })
    })
  }, [simMap])

  if (!grids) return null

  return (
    <GeoJSON
      key={`${JSON.stringify(simMap)}-${viewMode}-${JSON.stringify(filters)}`}
      data={grids}
      style={style}
      onEachFeature={onEachFeature}
    />
  )
}