import { useEffect, useState } from "react"
import { GeoJSON } from "react-leaflet"
import { api } from "../../api/api"

export default function DrainageLayer() {

  const [drains, setDrains] = useState(null)

  useEffect(() => {

    async function loadDrains() {

      const res = await api.get("/admin/drains")

      setDrains(res.data)

    }

    loadDrains()

  }, [])

  function style() {

    return {
      color: "#1e90ff",
      weight: 2,
      opacity: 0.9
    }

  }

  if (!drains) return null

  return (

    <GeoJSON
      data={drains}
      style={style}
    />

  )

}