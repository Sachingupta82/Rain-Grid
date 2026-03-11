export default function TimelineSlider() {

  return (

    <div className="h-[120px] bg-gray-900 text-white flex items-center px-6">

      <div className="w-full">

        <div className="text-sm mb-2">

          Rainfall & Flow Simulation Timeline

        </div>

        <input
          type="range"
          min="0"
          max="24"
          className="w-full"
        />

        <div className="flex justify-between text-xs mt-2">

          <span>18:00</span>
          <span>20:00</span>
          <span>22:00</span>
          <span>00:00</span>
          <span>02:00</span>
          <span>04:00</span>
          <span>06:00</span>

        </div>

      </div>

    </div>

  )

}