import geopandas as gpd

# load grids
grids = gpd.read_file("../../backend/src/data/delhi_grids_with_wards.geojson")

# load drains
drains = gpd.read_file("../../backend/src/data/barapulla_drains.geojson")

print("Grids:", len(grids))
print("Drains:", len(drains))

# convert CRS to meters
grids = grids.to_crs(epsg=3857)
drains = drains.to_crs(epsg=3857)

# compute nearest drains
nearest = gpd.sjoin_nearest(
    grids,
    drains,
    how="left",
    distance_col="distance_to_drain"
)

# remove duplicates (keep closest)
nearest = nearest.sort_values("distance_to_drain").drop_duplicates(subset="grid_id")

# keep needed columns
nearest = nearest[
    ["grid_id", "ward_id", "ward_name", "distance_to_drain", "geometry"]
]

# convert back to lat/lon
nearest = nearest.to_crs(epsg=4326)

# save
nearest.to_file("grids_with_drain_distance.geojson", driver="GeoJSON")

print("✅ Final grid count:", len(nearest))