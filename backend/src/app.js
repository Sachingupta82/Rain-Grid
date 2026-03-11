const express = require("express");
const cors = require("cors");
const simulationRoutes = require("./routes/simulation.routes");
const mapRoutes = require("./routes/map.routes");
const readinessRoutes = require("./routes/readiness.routes");
const pumpRoutes = require("./routes/pump.routes");
const engineerRoutes = require("./routes/engineer.routes");
const wardRoutes = require("./routes/ward.routes");
const adminRoutes = require("./routes/admin.routes");
const infrastructureRoutes = require("./routes/infrastructure.routes");
const forecastRoutes = require("./routes/forecast.routes");
const optimizationRoutes = require("./routes/optimization.routes");
const spreadRoutes = require("./routes/spread.routes");
const commandRoutes = require("./routes/command.routes");
const heatmapRoutes = require("./routes/heatmap.routes");
const cityRoutes = require("./routes/city.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "RainGrid Flood Intelligence API is running"
  });
});

app.use("/api/map", mapRoutes);
app.use("/api/simulation", simulationRoutes);
app.use("/api/readiness", readinessRoutes);
app.use("/api/pumps", pumpRoutes);
app.use("/api/engineer", engineerRoutes);
app.use("/api/ward", wardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", infrastructureRoutes);
app.use("/api/admin", forecastRoutes);
app.use("/api/admin", optimizationRoutes);
app.use("/api/admin", spreadRoutes);
app.use("/api/admin", commandRoutes);
app.use("/api/admin", heatmapRoutes);
app.use("/api/admin", cityRoutes);

module.exports = app;