import geopandas as gpd
import numpy as np

# load dataset
grids = gpd.read_file("../../backend/src/data/grids_with_elevation.geojson")

# compute centroids
grids["centroid"] = grids.geometry.centroid

# extract coordinates
grids["x"] = grids.centroid.x
grids["y"] = grids.centroid.y

# simple slope estimation
slopes = []

for i, row in grids.iterrows():
    x = row["x"]
    y = row["y"]
    elevation = row["elevation"]

    # find nearby grids
    neighbors = grids[
        (abs(grids["x"] - x) < 0.01) &
        (abs(grids["y"] - y) < 0.01) &
        (grids.index != i)
    ]

    if len(neighbors) > 0:
        elevation_diff = abs(neighbors["elevation"].mean() - elevation)
        slope = elevation_diff / 600   # grid size
    else:
        slope = 0

    slopes.append(slope)

grids["slope"] = slopes

# remove temp columns
grids = grids.drop(columns=["centroid", "x", "y"])

# save
grids.to_file("grids_with_slope.geojson", driver="GeoJSON")

print("✅ Slope calculated for", len(grids), "grids")