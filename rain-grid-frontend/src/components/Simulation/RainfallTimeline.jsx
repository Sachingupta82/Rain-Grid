import { useState } from "react"

export default function RainfallTimeline() {

  const [hour, setHour] = useState(12)

  return (

    <div className="bg-gradient-to-r from-blue-900 to-black text-white px-6 py-4">

      <div className="text-sm mb-3">

        Rainfall Forecast Timeline

      </div>

      <input
        type="range"
        min="0"
        max="24"
        value={hour}
        onChange={(e)=>setHour(e.target.value)}
        className="w-full accent-blue-400"
      />

      <div className="flex justify-between text-xs mt-2 opacity-80">

        <span>00:00</span>
        <span>04:00</span>
        <span>08:00</span>
        <span>12:00</span>
        <span>16:00</span>
        <span>20:00</span>
        <span>24:00</span>

      </div>

    </div>

  )

}