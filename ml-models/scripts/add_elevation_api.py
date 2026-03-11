import geopandas as gpd
import requests
import time

# load grids
grids = gpd.read_file("../../backend/src/data/grids_with_drain_distance.geojson")

# compute centroids
grids["centroid"] = grids.geometry.centroid

batch_size = 100
elevations = []

for i in range(0, len(grids), batch_size):

    batch = grids.iloc[i:i+batch_size]

    locations = "|".join(
        f"{row.centroid.y},{row.centroid.x}"
        for _, row in batch.iterrows()
    )

    url = f"https://api.open-elevation.com/api/v1/lookup?locations={locations}"

    response = requests.get(url)
    data = response.json()

    for result in data["results"]:
        elevations.append(result["elevation"])

    print("Processed grids:", i + len(batch))

    time.sleep(0.5)

# attach elevations
grids["elevation"] = elevations

# drop centroid
grids = grids.drop(columns=["centroid"])

# save file
grids.to_file("grids_with_elevation.geojson", driver="GeoJSON")

print("✅ Elevation added for", len(grids), "grids")