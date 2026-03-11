import geopandas as gpd

# load grids
grids = gpd.read_file("delhi_grids.geojson")

# load wards
wards = gpd.read_file("../../backend/src/data/Delhi_Wards.geojson")

# convert both to projected CRS (meters)
grids = grids.to_crs(epsg=3857)
wards = wards.to_crs(epsg=3857)

# compute centroids safely
grids["centroid"] = grids.geometry.centroid
centroids = grids.set_geometry("centroid")

# spatial join using centroid
grid_with_wards = gpd.sjoin(
    centroids,
    wards,
    how="left",
    predicate="within"
)

# restore original geometry
grid_with_wards = grid_with_wards.set_geometry("geometry")

# keep only necessary columns
grid_with_wards = grid_with_wards[
    ["grid_id", "Ward_Name", "Ward_No", "geometry"]
]

# rename fields
grid_with_wards.rename(columns={
    "Ward_Name": "ward_name",
    "Ward_No": "ward_id"
}, inplace=True)

# convert back to lat/lon
grid_with_wards = grid_with_wards.to_crs(epsg=4326)

# save
grid_with_wards.to_file("delhi_grids_with_wards.geojson", driver="GeoJSON")

print("✅ Final grid count:", len(grid_with_wards))