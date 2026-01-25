const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
// Routes
const swaggerSpec = require("./config/swagger");
const authRoutes = require("./routes/authRoutes");
const questRoutes = require("./routes/questRoutes");
//for test db
const pool = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/quests", questRoutes);

// Swagger
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.json({ status: "Backend running" });
});

//for test db conn
// app.get("/db-test", async (req, res) => {
//   const result = await pool.query("SELECT NOW()");
//   console.log(result);
//   res.json(result.rows[0]);
// });

module.exports = app;