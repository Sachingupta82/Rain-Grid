import geopandas as gpd
import json

print("Loading grids...")

grids = gpd.read_file("../../backend/src/data/grids_with_risk.geojson")

neighbors = {}

print("Building neighbor graph...")

for i, grid in grids.iterrows():

    touching = grids[grids.geometry.touches(grid.geometry)]

    neighbors[int(grid["grid_id"])] = touching["grid_id"].tolist()

print("Saving neighbor network...")

with open("../../backend/src/data/grid_neighbors.json", "w") as f:
    json.dump(neighbors, f)

print("Neighbor graph created for", len(neighbors), "grids")