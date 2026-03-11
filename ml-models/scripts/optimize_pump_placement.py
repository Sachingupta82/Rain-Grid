import json
import geopandas as gpd

print("Loading grids...")
grids = gpd.read_file("../../backend/src/data/grids_with_risk.geojson")

print("Loading water simulation...")
with open("../../backend/src/data/grid_water_simulation.json") as f:
    water = json.load(f)

print("Analyzing flood clusters...")

flooded = []

for gid, data in water.items():
    if data["risk"] == "HIGH":
        flooded.append(int(gid))

print("Total flooded grids:", len(flooded))

clusters = {}

for gid in flooded:

    grid = grids[grids["grid_id"] == gid].iloc[0]

    ward = grid["ward_id"]

    if ward not in clusters:
        clusters[ward] = []

    clusters[ward].append(gid)

print("Calculating pump requirements...")

pump_plan = []

for ward, grids_list in clusters.items():

    required = max(1, len(grids_list)//20)

    pump_plan.append({
        "ward_id": ward,
        "flooded_grids": len(grids_list),
        "recommended_pumps": required
    })

output_path = "../../backend/src/data/pump_deployment_plan.json"

with open(output_path, "w") as f:
    json.dump(pump_plan, f)

print("Pump plan saved:", output_path)