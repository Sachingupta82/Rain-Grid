import { useMapViewStore } from "../../store/mapViewStore"

export default function MapControls() {

  const { viewMode, setViewMode, filters, toggleFilter } =
    useMapViewStore()

  return (

    <div className="absolute top-4 left-4 z-[1000] bg-white/80 backdrop-blur-md shadow-xl rounded-lg p-4 w-[260px]">

      <h3 className="text-sm font-semibold mb-3">
        Map View
      </h3>

      <div className="flex flex-col gap-2 mb-4">

        <button
          onClick={() => setViewMode("risk")}
          className={`p-2 rounded ${
            viewMode === "risk"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Risk Map
        </button>

        <button
          onClick={() => setViewMode("ward")}
          className={`p-2 rounded ${
            viewMode === "ward"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Ward View
        </button>

        <button
          onClick={() => setViewMode("drainage")}
          className={`p-2 rounded ${
            viewMode === "drainage"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Drainage Network
        </button>

      </div>

      <h3 className="text-sm font-semibold mb-2">
        Filters
      </h3>

      <div className="flex flex-col gap-2">

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.showHigh}
            onChange={() => toggleFilter("showHigh")}
          />
          High Risk Only
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.showMedium}
            onChange={() => toggleFilter("showMedium")}
          />
          Medium Risk
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.showLowElevation}
            onChange={() => toggleFilter("showLowElevation")}
          />
          Low Elevation
        </label>

      </div>

    </div>

  )

}