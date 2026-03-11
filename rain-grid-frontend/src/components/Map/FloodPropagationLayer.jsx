import { useEffect, useState } from "react"
import { GeoJSON } from "react-leaflet"
import { api } from "../../api/api"
import floodData from "../../data/flood_propagation_results.json"

export default function FloodPropagationLayer() {

  const [grids, setGrids] = useState(null)
  const [step, setStep] = useState(0)

  /* load grids */

  useEffect(() => {

    async function loadGrids() {

      const res = await api.get("/map/grids")

      setGrids(res.data.data)

    }

    loadGrids()

  }, [])

  /* animation timer */

  useEffect(() => {

    const interval = setInterval(() => {

      setStep(prev => prev + 1)

    }, 1000)

    return () => clearInterval(interval)

  }, [])

  /* color logic */

  function getColor(gridId) {

    const flood = floodData[gridId]

    if (!flood) return null

    if (flood.step <= step) {

      if (flood.level === "HIGH") return "#ff2d55"

      if (flood.level === "MEDIUM") return "#ff9500"

      return "#34c759"
    }

    return null
  }

  /* grid style */

  function style(feature) {

    const gridId = feature.properties.grid_id

    const color = getColor(gridId)

    if (!color) {

      return {
        fillOpacity: 0,
        weight: 0
      }

    }

    return {
      fillColor: color,
      color: color,
      weight: 0.3,
      fillOpacity: 0.6
    }

  }

  /* popup + click */

  function onEachFeature(feature, layer) {

    const p = feature.properties

    layer.bindPopup(`
      <b>Grid:</b> ${p.grid_id}<br/>
      <b>Ward:</b> ${p.ward_name}<br/>
      <b>Elevation:</b> ${p.elevation || "N/A"}<br/>
      <b>Slope:</b> ${p.slope || "N/A"}
    `)

  }

  if (!grids) return null

  return (

    <GeoJSON
      data={grids}
      style={style}
      onEachFeature={onEachFeature}
      key={step}
    />

  )

}