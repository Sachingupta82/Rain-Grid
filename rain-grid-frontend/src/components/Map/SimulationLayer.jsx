import { useEffect, useState, useMemo } from "react"
import { GeoJSON } from "react-leaflet"
import { api } from "../../api/api"

export default function SimulationLayer({ simulation }) {

  const [grids, setGrids] = useState(null)

  useEffect(() => {

    async function loadGrids() {

      const res = await api.get("/map/grids")

      setGrids(res.data.data)

    }

    loadGrids()

  }, [])

  const simulationMap = useMemo(() => {

    if (!simulation || !simulation.simulated_grids)
      return {}

    const map = {}

    simulation.simulated_grids.forEach(g => {

      map[g.grid_id] = g.simulated_risk

    })

    return map

  }, [simulation])

  function getColor(risk) {

    if (risk > 0.7) return "#ff2d55"
    if (risk > 0.4) return "#ff9500"
    return "#34c759"

  }

  function style(feature) {

    const gridId = feature.properties.grid_id

    const risk = simulationMap[gridId]

    if (risk === undefined) {

      return {
        fillOpacity: 0,
        weight: 0
      }

    }

    return {

      fillColor: getColor(risk),
      color: getColor(risk),
      weight: 0.3,
      fillOpacity: 0.6

    }

  }

  if (!grids) return null

  return (

    <GeoJSON
      key={JSON.stringify(simulation)}
      data={grids}
      style={style}
    />

  )

}