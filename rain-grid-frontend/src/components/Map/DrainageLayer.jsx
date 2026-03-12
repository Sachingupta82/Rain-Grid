import { useEffect, useState } from "react"
import { GeoJSON } from "react-leaflet"
import { api } from "../../api/api"

export default function DrainageLayer() {
  const [drains, setDrains] = useState(null)

  useEffect(() => {
    /* correct endpoint: /infrastructure/drains */
    api.get("/admin/drains")
      .then(res => setDrains(res.data))
      .catch(() => {})
  }, [])

  function style() {
    return {
      color: "#38bdf8",
      weight: 2.5,
      opacity: 0.85,
      dashArray: "4 3"
    }
  }

  if (!drains) return null

  return <GeoJSON data={drains} style={style} />
}