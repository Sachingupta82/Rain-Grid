import geopandas as gpd
import json

print("Loading grids...")

grids = gpd.read_file("../../backend/src/data/grids_with_risk.geojson")

print("Loading neighbor graph...")

with open("../../backend/src/data/grid_neighbors.json") as f:
    neighbors = json.load(f)

# -----------------------------
# Simulation parameters
# -----------------------------

rainfall_mm = 200        # change this to simulate scenarios
absorption_factor = 0.3  # how much rain ground absorbs
flow_factor = 0.25       # how much water flows to neighbors

# -----------------------------
# Initialize water levels
# -----------------------------

water_levels = {}

print("Initializing water accumulation...")

for idx, grid in grids.iterrows():

    gid = str(grid["grid_id"])

    slope = grid["slope"]
    elevation = grid["elevation"]

    # base rainfall accumulation
    base_water = rainfall_mm * 0.01

    # slope reduces accumulation
    slope_effect = 1 - slope

    # ground absorption
    absorbed = base_water * absorption_factor

    water = (base_water - absorbed) * slope_effect

    water_levels[gid] = water


# -----------------------------
# Propagate water between grids
# -----------------------------

print("Simulating water flow across grids...")

for gid, level in list(water_levels.items()):

    if gid not in neighbors:
        continue

    for n in neighbors[gid]:

        n = str(n)

        if n not in water_levels:
            continue

        # flow only if current grid has more water
        if water_levels[gid] > water_levels[n]:

            flow = (water_levels[gid] - water_levels[n]) * flow_factor

            water_levels[n] += flow
            water_levels[gid] -= flow


# -----------------------------
# Determine flood risk
# -----------------------------

flood_risk = {}

for gid, water in water_levels.items():

    risk = "LOW"

    if water > 2:
        risk = "HIGH"
    elif water > 1:
        risk = "MEDIUM"

    flood_risk[gid] = {
        "water_level": round(water, 3),
        "risk": risk
    }


# -----------------------------
# Save results
# -----------------------------

output_path = "../../backend/src/data/grid_water_simulation.json"

with open(output_path, "w") as f:
    json.dump(flood_risk, f)

print("Simulation complete")
print("Saved results to:", output_path)

# print first few results
example = list(flood_risk.items())[:10]
print("Sample results:", example)