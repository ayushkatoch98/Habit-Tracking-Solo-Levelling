const pool = require("../config/db");

// CREATE QUEST
const createQuest = async (req, res, next) => {
  try {
    const { title, description, quest_type, xp_reward } = req.body;

    // Validation
    if (!title || !quest_type) {
      const error = new Error("Title and quest_type required");
      error.statusCode = 400;
      return next(error);
    }

    if (title.length < 1 || title.length > 255) {
      const error = new Error("Title must be between 1 and 255 characters");
      error.statusCode = 400;
      return next(error);
    }

    if (!["daily_quest", "penalty"].includes(quest_type)) {
      const error = new Error("Invalid quest_type. Must be 'daily_quest' or 'penalty'");
      error.statusCode = 400;
      return next(error);
    }

    if (xp_reward && (xp_reward < 1 || !Number.isInteger(xp_reward))) {
      const error = new Error("XP reward must be a positive integer");
      error.statusCode = 400;
      return next(error);
    }

    const result = await pool.query(
      `INSERT INTO quests (user_id, title, description, quest_type, xp_reward)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        req.userId,
        title,
        description || null,
        quest_type,
        xp_reward || 10
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// GET ALL QUEST
const getQuests = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT * FROM quests
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.userId]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

//UPDATE QUEST
const updateQuest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, quest_type, xp_reward } = req.body;

    // Validation
    if (title && (title.length < 1 || title.length > 255)) {
      const error = new Error("Title must be between 1 and 255 characters");
      error.statusCode = 400;
      return next(error);
    }

    if (quest_type && !["daily_quest", "penalty"].includes(quest_type)) {
      const error = new Error("Invalid quest_type. Must be 'daily_quest' or 'penalty'");
      error.statusCode = 400;
      return next(error);
    }

    if (xp_reward && (xp_reward < 1 || !Number.isInteger(xp_reward))) {
      const error = new Error("XP reward must be a positive integer");
      error.statusCode = 400;
      return next(error);
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (quest_type !== undefined) {
      updates.push(`quest_type = $${paramCount++}`);
      values.push(quest_type);
    }
    if (xp_reward !== undefined) {
      updates.push(`xp_reward = $${paramCount++}`);
      values.push(xp_reward);
    }

    if (updates.length === 0) {
      const error = new Error("No fields to update");
      error.statusCode = 400;
      return next(error);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id, req.userId);

    const result = await pool.query(
      `UPDATE quests
       SET ${updates.join(", ")}
       WHERE id = $${paramCount++} AND user_id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      const error = new Error("Quest not found");
      error.statusCode = 404;
      return next(error);
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

//DELETE QUEST
const deleteQuest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM quests
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      const error = new Error("Quest not found");
      error.statusCode = 404;
      return next(error);
    }

    res.json({ message: "Quest deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createQuest,
  getQuests,
  updateQuest,
  deleteQuest
};
