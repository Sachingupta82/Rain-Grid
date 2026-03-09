const express = require("express");
const cors = require("cors");
const mapRoutes = require("./routes/map.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "RainGrid Flood Intelligence API is running"
  });
});

app.use("/api/map", mapRoutes);

module.exports = app;