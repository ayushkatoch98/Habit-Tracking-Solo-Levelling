const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const {
  createQuest,
  getQuests,
  updateQuest,
  deleteQuest
} = require("../controllers/questController");

router.use(authMiddleware);

/**
 * @swagger
 * /api/quests:
 *   post:
 *     summary: Create a new quest
 *     description: Create a new quest for the authenticated user
 *     tags: [Quests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/QuestRequest"
 *           examples:
 *             dailyQuest:
 *               value:
 *                 title: "Complete morning workout"
 *                 description: "Do 30 minutes of exercise"
 *                 quest_type: "daily_quest"
 *                 xp_reward: 10
 *             penalty:
 *               value:
 *                 title: "Missed workout"
 *                 description: "Penalty for missing workout"
 *                 quest_type: "penalty"
 *                 xp_reward: 5
 *     responses:
 *       201:
 *         description: Quest successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Quest"
 *       400:
 *         $ref: "#/components/responses/ValidationError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.post("/", createQuest);

/**
 * @swagger
 * /api/quests:
 *   get:
 *     summary: Get all quests
 *     description: Retrieve all quests for the authenticated user
 *     tags: [Quests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of quests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Quest"
 *             example:
 *               - id: 1
 *                 user_id: 1
 *                 title: "Complete morning workout"
 *                 description: "Do 30 minutes of exercise"
 *                 quest_type: "daily_quest"
 *                 xp_reward: 10
 *                 completed: false
 *                 created_at: "2024-01-01T00:00:00.000Z"
 *                 updated_at: "2024-01-01T00:00:00.000Z"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get("/", getQuests);

/**
 * @swagger
 * /api/quests/{id}:
 *   put:
 *     summary: Update a quest
 *     description: Update an existing quest by ID (only quests owned by the authenticated user)
 *     tags: [Quests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quest ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 example: "Updated quest title"
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 nullable: true
 *                 example: "Updated quest description"
 *               quest_type:
 *                 type: string
 *                 enum: [daily_quest, penalty]
 *                 example: "daily_quest"
 *               xp_reward:
 *                 type: integer
 *                 minimum: 1
 *                 example: 15
 *     responses:
 *       200:
 *         description: Quest successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Quest"
 *       400:
 *         $ref: "#/components/responses/ValidationError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       404:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.put("/:id", updateQuest);

/**
 * @swagger
 * /api/quests/{id}:
 *   delete:
 *     summary: Delete a quest
 *     description: Delete a quest by ID (only quests owned by the authenticated user)
 *     tags: [Quests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quest ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Quest successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Quest deleted"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       404:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.delete("/:id", deleteQuest);

module.exports = router;
