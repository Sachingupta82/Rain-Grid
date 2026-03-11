import geopandas as gpd

print("Loading grids...")
grids = gpd.read_file("../../backend/src/data/grids_with_risk.geojson")

print("Loading drains...")
drains = gpd.read_file("../../backend/src/data/barapulla_drains.geojson")

# convert to projected CRS (meters)
grids = grids.to_crs(epsg=32643)
drains = drains.to_crs(epsg=32643)

density_values = []

radius = 300  # meters

print("Calculating drain density...")

for idx, grid in grids.iterrows():

    centroid = grid.geometry.centroid

    nearby = drains[
        drains.geometry.distance(centroid) < radius
    ]

    density = len(nearby)

    density_values.append(density)

grids["drain_density"] = density_values

# convert back to lat/lng for geojson
grids = grids.to_crs(epsg=4326)

output_path = "../../backend/src/data/grids_with_drain_density.geojson"

grids.to_file(output_path)

print("Drain density added for", len(grids))
print("Saved to:", output_path)