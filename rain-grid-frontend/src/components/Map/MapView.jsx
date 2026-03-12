import { MapContainer, TileLayer } from "react-leaflet"
import GridLayer from "./GridLayer"
import DrainageLayer from "./DrainageLayer"
import MapControls from "./MapControls"
import CityPanel from "../Dashboard/CityPanel"
import PumpsLayer from "./PumpsLayer"
import { useMapViewStore } from "../../store/mapViewStore"

export default function MapView() {
  const { viewMode } = useMapViewStore()

  return (
    <MapContainer
      center={[28.6139, 77.209]}
      zoom={11}
      style={{ height: "100%", width: "100%", background: "#060d1f" }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        className="map-tiles-dark"
      />

      {viewMode === "drainage" ? <DrainageLayer /> : <GridLayer />}

      <PumpsLayer />
      <MapControls />
      <CityPanel />
    </MapContainer>
  )
}