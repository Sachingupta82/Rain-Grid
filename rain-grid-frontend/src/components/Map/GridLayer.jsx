import { useEffect, useState, useMemo } from "react"
import { GeoJSON } from "react-leaflet"
import { api } from "../../api/api"
import { useMapViewStore } from "../../store/mapViewStore"
import { useSimulationStore } from "../../store/simulationStore"

/* ---------- WARD COLOR MAP (stable across renders) ---------- */

const wardColorMap = {}

function getWardColor(wardId) {

  if (!wardColorMap[wardId]) {

    const hue = Object.keys(wardColorMap).length * 47

    wardColorMap[wardId] = `hsl(${hue % 360},70%,65%)`

  }

  return wardColorMap[wardId]

}

export default function GridLayer() {

  const [grids, setGrids] = useState(null)

  const { viewMode, filters } = useMapViewStore()

  const simulation = useSimulationStore(
    state => state.simulationResult
  )

  useEffect(() => {

    async function loadGrids() {

      const res = await api.get("/map/grids")

      setGrids(res.data.data)

    }

    loadGrids()

  }, [])

  /* ---------- CREATE SIMULATION MAP ---------- */

  const simMap = useMemo(() => {

    if (!simulation || !simulation.simulated_grids)
      return {}

    const map = {}

    simulation.simulated_grids.forEach(g => {
      map[g.grid_id] = g.simulated_risk
    })

    return map

  }, [simulation])

  /* ---------- COLOR SCALE ---------- */

  function getRiskColor(risk) {

    if (risk > 0.7) return "#ef4444"   // red
    if (risk > 0.4) return "#f59e0b"   // orange
    return "#22c55e"                   // green

  }

  /* ---------- STYLE ---------- */

  function style(feature) {

    const p = feature.properties

    let risk = p.risk_score

    /* APPLY SIMULATION RISK */

    if (simMap[p.grid_id] !== undefined) {
      risk = simMap[p.grid_id]
    }

    /* FILTERS */

    if (filters.showHigh && risk < 0.7)
      return null

    if (filters.showMedium && (risk < 0.4 || risk > 0.7))
      return null

    if (filters.showLowElevation && p.elevation > 220)
      return null

    /* WARD MODE */

    if (viewMode === "ward") {

      const color = getWardColor(p.ward_id)

      return {
        fillColor: color,
        color: "#ffffff",
        weight: 0.2,
        fillOpacity: 0.6
      }

    }

    /* RISK MODE */

    const color = getRiskColor(risk)

    return {
      fillColor: color,
      color: "#ffffff",
      weight: 0.2,
      fillOpacity: 0.7
    }

  }

  /* ---------- POPUPS ---------- */

  function onEachFeature(feature, layer) {

    const p = feature.properties

    let simRisk = null

    if (simMap[p.grid_id] !== undefined) {
      simRisk = simMap[p.grid_id]
    }

    layer.bindPopup(`
      <b>Grid:</b> ${p.grid_id}<br/>
      <b>Ward:</b> ${p.ward_name}<br/>
      <b>Base Risk:</b> ${p.risk_score.toFixed(2)}<br/>
      ${simRisk ? `<b>Simulated Risk:</b> ${simRisk.toFixed(2)}` : ""}
    `)

  }

  if (!grids) return null

  return (

    <GeoJSON
      key={JSON.stringify(simulation)}
      data={grids}
      style={style}
      onEachFeature={onEachFeature}
    />

  )

}