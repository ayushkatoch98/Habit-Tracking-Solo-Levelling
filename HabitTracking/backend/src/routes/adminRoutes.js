const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

// Basic SQL runner (restricted to SELECT/UPDATE/DELETE/INSERT, single statement)
router.post("/sql", async (req, res, next) => {
  const { query, params } = req.body || {};

  if (!query || typeof query !== "string") {
    return res.status(400).json({ message: "Query is required" });
  }

  const cleaned = query.trim();
  if (!cleaned) {
    return res.status(400).json({ message: "Query is required" });
  }

  // Disallow multi-statement
  if (cleaned.includes(";")) {
    return res.status(400).json({ message: "Only single-statement queries are allowed" });
  }

  // Allow only select/update/delete/insert
  const allowed = /^(select|update|delete|insert)\b/i;
  if (!allowed.test(cleaned)) {
    return res.status(400).json({ message: "Only SELECT, UPDATE, DELETE, INSERT are allowed" });
  }

  try {
    const result = await pool.query(cleaned, Array.isArray(params) ? params : []);
    res.json({
      rowCount: result.rowCount,
      rows: result.rows || []
    });
  } catch (err) {
    next(err);
  }
});

// Simple schema view for public tables
router.get("/schema", async (req, res, next) => {
  try {
    const result = await pool.query(
      `
      SELECT table_name, column_name, data_type, is_nullable, column_default, ordinal_position
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
      `
    );

    const tables = {};
    for (const row of result.rows) {
      if (!tables[row.table_name]) {
        tables[row.table_name] = [];
      }
      tables[row.table_name].push({
        name: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable === "YES",
        default: row.column_default || null
      });
    }

    res.json({ tables });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
