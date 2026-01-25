const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with username, email, and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/RegisterRequest"
 *           examples:
 *             example1:
 *               value:
 *                 username: "player1"
 *                 email: "player1@example.com"
 *                 password: "password123"
 *     responses:
 *       201:
 *         description: User successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 *             example:
 *               id: 1
 *               username: "player1"
 *               email: "player1@example.com"
 *               level: 1
 *               xp: 0
 *       400:
 *         $ref: "#/components/responses/ValidationError"
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *             example:
 *               message: "User already exists"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user and receive JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/LoginRequest"
 *           examples:
 *             example1:
 *               value:
 *                 email: "player1@example.com"
 *                 password: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/LoginResponse"
 *             example:
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               user:
 *                 id: 1
 *                 username: "player1"
 *                 email: "player1@example.com"
 *                 level: 1
 *                 xp: 0
 *       400:
 *         $ref: "#/components/responses/ValidationError"
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *             example:
 *               message: "Invalid credentials"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.post("/login", login);

module.exports = router;
