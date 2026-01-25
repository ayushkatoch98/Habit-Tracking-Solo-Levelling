const pool = require("../config/db");

// CREATE QUEST
const createQuest = async (req, res) => {
  try {
    const { title, description, quest_type, xp_reward } = req.body;

    if (!title || !quest_type) {
      return res.status(400).json({ message: "Title and quest_type required" });
    }

    if (!["daily_quest", "penalty"].includes(quest_type)) {
      return res.status(400).json({ message: "Invalid quest_type" });
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
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL QUEST
const getQuests = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM quests
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//UPDATE QUEST
const updateQuest = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, quest_type, xp_reward } = req.body;

    const result = await pool.query(
      `UPDATE quests
       SET title = $1,
           description = $2,
           quest_type = $3,
           xp_reward = $4
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [
        title,
        description,
        quest_type,
        xp_reward,
        id,
        req.userId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Quest not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//DELETE QUEST
const deleteQuest = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM quests
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Quest not found" });
    }

    res.json({ message: "Quest deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createQuest,
  getQuests,
  updateQuest,
  deleteQuest
};
