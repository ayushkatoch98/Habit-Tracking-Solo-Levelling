const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authMiddleware = require("../middlewares/authMiddleware");
const { addXP } = require("../utils/xpCalculator");

router.use(authMiddleware);

/**
 * @swagger
 * /api/quest-logs:
 *   get:
 *     summary: Get all quest logs
 *     description: Retrieve all quest logs for the authenticated user
 *     tags: [QuestLogs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of quest logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/QuestLog"
 *             example:
 *               - id: 1
 *                 status: "PENDING"
 *                 created_at: "2024-01-01T00:00:00.000Z"
 *                 title: "Complete morning workout"
 *                 description: "Do 30 minutes of exercise"
 *                 quest_type: "daily_quest"
 *                 xp_reward: 10
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get("/", async (req, res, next) => {
  try {
    const userId = req.userId; 

    const { rows } = await pool.query(`
      SELECT
        ql.id,
        ql.status,
        ql.created_at,
        q.title,
        q.description,
        q.quest_type,
        q.xp_reward
      FROM quest_logs ql
      JOIN quests q ON q.id = ql.quest_id
      WHERE ql.user_id = $1
      ORDER BY ql.created_at DESC
    `, [userId]);

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/quest-logs/{id}:
 *   get:
 *     summary: Get a single quest log
 *     description: Retrieve a specific quest log by ID for the authenticated user
 *     tags: [QuestLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quest log ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Quest log details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/QuestLog"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       404:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get("/:id", async (req, res, next) => {
  try {
    const questLogId = req.params.id;
    const userId = req.userId;

    const { rows } = await pool.query(`
      SELECT
        ql.id,
        ql.status,
        ql.created_at,
        q.title,
        q.description,
        q.quest_type,
        q.xp_reward
      FROM quest_logs ql
      JOIN quests q ON q.id = ql.quest_id
      WHERE ql.id = $1 AND ql.user_id = $2
    `, [questLogId, userId]);

    if (rows.length === 0) {
      const error = new Error("Quest log not found");
      error.statusCode = 404;
      return next(error);
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/quest-logs/{id}:
 *   patch:
 *     summary: Update quest log status
 *     description: Update the status of a quest log (COMPLETED or FAILED)
 *     tags: [QuestLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quest log ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [COMPLETED, FAILED]
 *                 description: Quest log status
 *                 example: "COMPLETED"
 *           examples:
 *             completed:
 *               value:
 *                 status: "COMPLETED"
 *             failed:
 *               value:
 *                 status: "FAILED"
 *     responses:
 *       200:
 *         description: Quest log successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/QuestLogFull"
 *       400:
 *         $ref: "#/components/responses/ValidationError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       404:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.patch("/:id", async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    const questLogId = req.params.id; 
    const { status } = req.body;
    const userId = req.userId;

    if (!["COMPLETED", "FAILED"].includes(status)) {
      await client.query("ROLLBACK");
      const error = new Error("Invalid status");
      error.statusCode = 400;
      return next(error);
    }

    const questLogResult = await client.query(`
      SELECT ql.*, q.xp_reward, q.quest_type
      FROM quest_logs ql
      JOIN quests q ON q.id = ql.quest_id
      WHERE ql.id = $1 AND ql.user_id = $2
      FOR UPDATE
    `, [questLogId, userId]);

    if (questLogResult.rows.length === 0) {
      await client.query("ROLLBACK");
      const error = new Error("Quest log not found");
      error.statusCode = 404;
      return next(error);
    }

    const questLog = questLogResult.rows[0];
    
    if (questLog.status === status) {
      await client.query("ROLLBACK");
      return res.json(questLog);
    }

    const updateResult = await client.query(`
      UPDATE quest_logs
      SET status = $1, updated_at = NOW()
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `, [status, questLogId, userId]);

    let xpResult = null;
    if (status === "COMPLETED" && questLog.status !== "COMPLETED") {
      xpResult = await addXP(client, userId, questLog.xp_reward);
    }

    await client.query("COMMIT");

    res.json({
      ...updateResult.rows[0],
      xp: xpResult ? xpResult.xp : undefined,
      level: xpResult ? xpResult.level : undefined,
      levelUp: xpResult ? xpResult.levelUp : undefined,
      xpGained: xpResult ? xpResult.xpGained : undefined
    });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
});


module.exports = router;
