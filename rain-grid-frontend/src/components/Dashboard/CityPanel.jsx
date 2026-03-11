import { useEffect, useState } from "react"
import { api } from "../../api/api"

export default function CityPanel() {

  const [stats, setStats] = useState(null)

  useEffect(() => {

    async function loadStats() {

      const res = await api.get("/admin/statistics")

      setStats(res.data)

    }

    loadStats()

  }, [])

  if (!stats) return null

  return (

    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-lg shadow-xl rounded-lg p-4">

      <h3 className="font-semibold mb-2">City Overview</h3>

      <div className="text-sm">

        <div>Total Wards: {stats.total_wards}</div>
        <div>Total Grids: {stats.total_grids}</div>
        <div>High Risk Grids: {stats.high_risk}</div>

      </div>

    </div>

  )

}