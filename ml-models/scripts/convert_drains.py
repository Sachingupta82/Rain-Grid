import geopandas as gpd

# load KML
drains = gpd.read_file(
    "../../backend/src/data/barapulla_drains.kml",
    driver="KML"
)

print("Loaded drains:", len(drains))

# convert CRS to standard lat/lon
drains = drains.to_crs(epsg=4326)

# save as GeoJSON
drains.to_file(
    "barapulla_drains.geojson",
    driver="GeoJSON"
)

print("✅ Converted to GeoJSON")