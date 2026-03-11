import { useEffect, useState } from "react"
import { GeoJSON } from "react-leaflet"
import { api } from "../../api/api"

export default function BaseGridLayer() {

  const [grids, setGrids] = useState(null)

  useEffect(() => {

    async function loadGrids() {

      const res = await api.get("/map/grids")

      setGrids(res.data.data)

    }

    loadGrids()

  }, [])

  function style() {

    return {

      color: "#555",
      weight: 0.2,
      fillOpacity: 0

    }

  }

  function onEachFeature(feature, layer) {

    const p = feature.properties

    layer.bindPopup(`
      <b>Grid:</b> ${p.grid_id}<br/>
      <b>Ward:</b> ${p.ward_name}<br/>
      <b>Elevation:</b> ${p.elevation}<br/>
      <b>Slope:</b> ${p.slope}
    `)

  }

  if (!grids) return null

  return (

    <GeoJSON
      data={grids}
      style={style}
      onEachFeature={onEachFeature}
    />

  )

}