import MapView from "../components/Map/MapView"
import SimulationPanel from "../components/Simulation/SimulationPanel"
import RainfallTimeline from "../components/Simulation/RainfallTimeline"

export default function Dashboard(){

  return(

    <div className="h-screen flex flex-col">

      <div className="flex flex-1">

        {/* MAP */}

        <div className="flex-1">

          <MapView/>

        </div>

        {/* CONTROL PANEL */}

        <div className="w-[360px] p-4 bg-gray-50">

          <SimulationPanel/>

        </div>

      </div>

      {/* TIMELINE */}

      <RainfallTimeline/>

    </div>

  )

}