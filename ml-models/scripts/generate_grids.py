import geopandas as gpd
from shapely.geometry import box
import numpy as np

# Load Delhi boundary
boundary = gpd.read_file("../../backend/src/data/Delhi_Boundary.geojson")

# Convert to projected CRS (meters)
boundary = boundary.to_crs(epsg=3857)

# Grid size in meters
grid_size = 600

xmin, ymin, xmax, ymax = boundary.total_bounds

cols = np.arange(xmin, xmax, grid_size)
rows = np.arange(ymin, ymax, grid_size)

polygons = []

for x in cols:
    for y in rows:
        polygons.append(box(x, y, x + grid_size, y + grid_size))

grid = gpd.GeoDataFrame({"geometry": polygons}, crs=boundary.crs)

# Keep grids inside Delhi
grid = gpd.overlay(grid, boundary, how="intersection")

# Add grid ID
grid["grid_id"] = range(len(grid))

# Convert back to lat/lon
grid = grid.to_crs(epsg=4326)

# Save file
grid.to_file("delhi_grids.geojson", driver="GeoJSON")

print("✅ Generated", len(grid), "grid cells")