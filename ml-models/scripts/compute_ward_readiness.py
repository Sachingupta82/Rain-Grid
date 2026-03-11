import geopandas as gpd

# load grids dataset
grids = gpd.read_file("../../backend/src/data/grids_with_risk.geojson")

# group by ward
ward_stats = grids.groupby("ward_id").agg({
    "risk_score": "mean",
    "grid_id": "count"
}).reset_index()

ward_stats.rename(columns={
    "risk_score": "avg_risk",
    "grid_id": "total_grids"
}, inplace=True)

# count high risk grids
high_risk = grids[grids["risk_level"] == "HIGH"].groupby("ward_id").size()

ward_stats["high_risk_grids"] = ward_stats["ward_id"].map(high_risk).fillna(0)

# compute readiness score
ward_stats["readiness_score"] = (1 - ward_stats["avg_risk"]) * 100

# classify readiness
ward_stats["status"] = "READY"

ward_stats.loc[ward_stats["readiness_score"] < 70, "status"] = "ATTENTION"
ward_stats.loc[ward_stats["readiness_score"] < 50, "status"] = "CRITICAL"

# save file
ward_stats.to_csv("ward_readiness.csv", index=False)

print("✅ Ward readiness calculated for", len(ward_stats), "wards")