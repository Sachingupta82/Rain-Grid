# import geopandas as gpd
# import pandas as pd
# import numpy as np
# import json

# # ---------------------------
# # LOAD GRID DATA
# # ---------------------------

# grid_path = "../../backend/src/data/grids_with_risk.geojson"

# gdf = gpd.read_file(grid_path)

# df = pd.DataFrame(gdf.drop(columns="geometry"))

# # ---------------------------
# # LOAD EVENTS
# # ---------------------------

# events_path = "../../backend/src/data/grid_events.json"

# with open(events_path) as f:
#     events = json.load(f)

# event_counts = {}

# for e in events:
#     event_counts[e["grid_id"]] = len(e["events"])

# df["event_count"] = df["grid_id"].map(event_counts).fillna(0)

# # ---------------------------
# # ADD RAINFALL DATA
# # ---------------------------

# np.random.seed(42)

# df["rainfall"] = np.random.randint(50, 400, len(df))

# # ---------------------------
# # DRAIN BLOCKAGE INDEX
# # ---------------------------

# df["drain_blockage"] = df["event_count"] * 0.1

# # ---------------------------
# # HISTORICAL FLOOD LABEL
# # ---------------------------

# df["flood"] = (df["risk_score"] > 0.65).astype(int)

# # ---------------------------
# # SAVE DATASET
# # ---------------------------

# df.to_csv("../training_dataset.csv", index=False)

# print("Training dataset created:", len(df))







import geopandas as gpd
import pandas as pd
import numpy as np
import json
import random

print("Loading grid data...")

grid_path = "../../backend/src/data/grids_with_risk.geojson"
gdf = gpd.read_file(grid_path)

df = pd.DataFrame(gdf.drop(columns="geometry"))

# ---------------------------
# LOAD EVENTS
# ---------------------------

events_path = "../../backend/src/data/grid_events.json"

try:
    with open(events_path) as f:
        events = json.load(f)
except:
    events = []

event_counts = {}

for e in events:
    event_counts[e["grid_id"]] = len(e["events"])

df["event_count"] = df["grid_id"].map(event_counts).fillna(0)

# ---------------------------
# REALISTIC RAINFALL
# ---------------------------

def generate_rainfall():

    scenario = random.choice([
        "light","moderate","heavy","extreme"
    ])

    if scenario == "light":
        return random.uniform(20,80)

    if scenario == "moderate":
        return random.uniform(80,150)

    if scenario == "heavy":
        return random.uniform(150,250)

    return random.uniform(250,350)

df["rainfall"] = [generate_rainfall() for _ in range(len(df))]

# ---------------------------
# DRAIN BLOCKAGE INDEX
# ---------------------------

df["drain_blockage"] = df["event_count"] * random.uniform(0.1,0.3)

# ---------------------------
# WATER ACCUMULATION
# ---------------------------

df["water_accumulation"] = (
    df["rainfall"] *
    (1 - df["slope"].fillna(0.003))
) / (df["drain_density"].fillna(2) + 0.5)

# ---------------------------
# FLOOD RULE ENGINE
# ---------------------------

def compute_flood(row):

    score = 0

    if row["rainfall"] > 180:
        score += 2

    if row["slope"] < 0.002:
        score += 1

    if row["distance_to_drain"] > 120:
        score += 1

    if row["drain_density"] < 1.5:
        score += 1

    if row["drain_blockage"] > 0.5:
        score += 1

    if row["water_accumulation"] > 120:
        score += 2

    return 1 if score >= 4 else 0

df["flood"] = df.apply(compute_flood, axis=1)

# ---------------------------
# SAVE DATASET
# ---------------------------

df = df[[
    "elevation",
    "slope",
    "distance_to_drain",
    "drain_density",
    "rainfall",
    "drain_blockage",
    "event_count",
    "water_accumulation",
    "flood"
]]

df.to_csv("../training_dataset.csv", index=False)

print("Dataset generated:", len(df))