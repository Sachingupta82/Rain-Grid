import json
import geopandas as gpd
import numpy as np

print("Loading data...")

# ----------------------------
# LOAD GRID DATA
# ----------------------------

grid_path = "../../backend/src/data/grids_with_risk.geojson"
gdf = gpd.read_file(grid_path)

# ----------------------------
# LOAD NEIGHBORS
# ----------------------------

with open("../../backend/src/data/grid_neighbors.json") as f:
    neighbors = json.load(f)

# ----------------------------
# LOAD WATER SIMULATION
# ----------------------------

with open("../../backend/src/data/grid_water_simulation.json") as f:
    water_data = json.load(f)

# ----------------------------
# PARAMETERS
# ----------------------------

RAIN_INTENSITY = 220   # mm rainfall scenario

FLOW_FACTOR = 0.35     # water transfer ratio

MAX_ITER = 4           # flood spread depth

# ----------------------------
# INITIAL WATER LEVEL
# ----------------------------

water_levels = {}

for feature in gdf.itertuples():

    grid_id = str(feature.grid_id)

    slope = feature.slope if feature.slope else 0.003
    drain_density = feature.drain_density if feature.drain_density else 2

    accumulation = (RAIN_INTENSITY * (1 - slope)) / (drain_density + 0.5)

    water_levels[grid_id] = accumulation

# ----------------------------
# FLOOD PROPAGATION
# ----------------------------

for i in range(MAX_ITER):

    new_levels = water_levels.copy()

    for grid_id, level in water_levels.items():

        if level < 120:
            continue

        neigh = neighbors.get(grid_id, [])

        spread = level * FLOW_FACTOR / max(len(neigh),1)

        for n in neigh:

            n = str(n)

            new_levels[n] = new_levels.get(n,0) + spread

    water_levels = new_levels

# ----------------------------
# CLASSIFY FLOOD RISK
# ----------------------------

flood_map = {}

for grid_id, level in water_levels.items():

    risk = "LOW"

    if level > 200:
        risk = "HIGH"

    elif level > 130:
        risk = "MEDIUM"

    flood_map[grid_id] = {
        "water_level": round(level,2),
        "risk": risk
    }

# ----------------------------
# SAVE RESULTS
# ----------------------------

with open("../flood_propagation_results.json","w") as f:
    json.dump(flood_map,f,indent=2)

print("Flood propagation simulation completed")