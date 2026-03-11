import geopandas as gpd

# load grids
grids = gpd.read_file("../../backend/src/data/grids_with_slope.geojson")

# normalize features
grids["elev_norm"] = (grids["elevation"].max() - grids["elevation"]) / (
    grids["elevation"].max() - grids["elevation"].min()
)

grids["slope_norm"] = (grids["slope"].max() - grids["slope"]) / (
    grids["slope"].max() - grids["slope"].min()
)

grids["drain_norm"] = grids["distance_to_drain"] / grids["distance_to_drain"].max()

# compute risk score
grids["risk_score"] = (
    grids["elev_norm"] * 0.4 +
    grids["slope_norm"] * 0.3 +
    grids["drain_norm"] * 0.3
)

# classify risk
grids["risk_level"] = "LOW"

grids.loc[grids["risk_score"] > 0.6, "risk_level"] = "HIGH"
grids.loc[(grids["risk_score"] > 0.4) & (grids["risk_score"] <= 0.6), "risk_level"] = "MEDIUM"

# drop temp columns
grids = grids.drop(columns=["elev_norm", "slope_norm", "drain_norm"])

# save dataset
grids.to_file("grids_with_risk.geojson", driver="GeoJSON")

print("✅ Flood risk score calculated for", len(grids), "grids")