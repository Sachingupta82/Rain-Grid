// require("dotenv").config();
// const app = require("./app");

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`🚀 RainGrid API running on port ${PORT}`);
// });











require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");

/* ---------------- PORT ---------------- */

const PORT = process.env.PORT || 5000;

/* ---------------- HTTP SERVER ---------------- */

const server = http.createServer(app);

/* ---------------- SOCKET SERVER ---------------- */

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

/* ---------------- SOCKET CONNECTION ---------------- */

io.on("connection", (socket) => {

  console.log("🟢 Dashboard connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Dashboard disconnected:", socket.id);
  });

  /* ---------------- FLOOD SIMULATION ---------------- */

  socket.on("run-simulation", async (params) => {

    try {

      const simulationService = require("./services/simulation.service");

      const result =
        await simulationService.simulateFloodLogic(params);

      socket.emit("simulation-result", result);

    } catch (error) {

      socket.emit("simulation-error", {
        message: "Simulation failed",
        error: error.message,
      });

    }

  });

});

/* ---------------- START SERVER ---------------- */

server.listen(PORT, () => {
  console.log(`🚀 RainGrid API running on port ${PORT}`);
});