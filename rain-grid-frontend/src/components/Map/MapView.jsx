import { MapContainer, TileLayer } from "react-leaflet"
import GridLayer from "./GridLayer"
import DrainageLayer from "./DrainageLayer"
import MapControls from "./MapControls"
import CityPanel from "../Dashboard/CityPanel"
import { useMapViewStore } from "../../store/mapViewStore"

export default function MapView() {

  const { viewMode } = useMapViewStore()

  return (

    <MapContainer
      center={[28.6139, 77.209]}
      zoom={11}
      style={{ height: "100vh", width: "100%" }}
    >

      <TileLayer
        attribution="OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {viewMode === "drainage"
        ? <DrainageLayer />
        : <GridLayer />
      }

      <MapControls />
      <CityPanel />

    </MapContainer>

  )

}