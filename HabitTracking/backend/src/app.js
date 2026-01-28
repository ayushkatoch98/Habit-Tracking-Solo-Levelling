const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
// Routes
const swaggerSpec = require("./config/swagger");
const authRoutes = require("./routes/authRoutes");
const questRoutes = require("./routes/questRoutes");
const questLogsRoutes = require("./routes/questLogsRoutes");
// Middlewares
const errorHandler = require("./middlewares/errorHandler");

const pool = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

//
app.get("/", (req, res) => {
  res.json({ 
    status: "Backend running",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/quests", questRoutes);
app.use("/api/quest-logs", questLogsRoutes);

// Swagger Documentation
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Habit Tracking API Documentation",
}));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;