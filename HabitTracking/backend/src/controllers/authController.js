const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const { xpRequiredForLevel } = require("../constant");
const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            const error = new Error("All fields required");
            error.statusCode = 400;
            return next(error);
        }

        if (username.length < 3 || username.length > 50) {
            const error = new Error("Username must be between 3 and 50 characters");
            error.statusCode = 400;
            return next(error);
        }

        if (password.length < 6) {
            const error = new Error("Password must be at least 6 characters");
            error.statusCode = 400;
            return next(error);
        }

        // Check if user exists
        const userExists = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (userExists.rows.length > 0) {
            const error = new Error("User already exists");
            error.statusCode = 409;
            return next(error);
        }

        // Hash password
        const hashedPassword = password;

        // Create user
        const newUser = await pool.query(
            `INSERT INTO users (username, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, level, xp`,
            [username, email, hashedPassword]
        );

        res.status(201).json(newUser.rows[0]);
    } catch (err) {
        next(err);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            const error = new Error("All fields required");
            error.statusCode = 400;
            return next(error);
        }

        // Find user
        const userResult = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (userResult.rows.length === 0) {
            const error = new Error("Invalid credentials");
            error.statusCode = 401;
            return next(error);
        }

        const user = userResult.rows[0];

        // Verify password
        const isMatch = password == user.password;

        console.log("Password match:", isMatch, password, user.password);

        if (!isMatch) {
            const error = new Error("Invalid credentials");
            error.statusCode = 401;
            return next(error);
        }

        // Generate token
        const token = jwt.sign(
            { userId: user.id, userEmail: user.email, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                level: user.level,
                xp: user.xp
            }
        });
    } catch (err) {
        next(err);
    }
};

//add later edit user 

const getProfile = async (req, res, next) => {
    try {
        const result = await pool.query(
            "SELECT id, username, email, level, xp FROM users WHERE id = $1",
            [req.userId]
        );

        if (result.rows.length === 0) {
            const error = new Error("User not found");
            error.statusCode = 404;
            return next(error);
        }

        let user = result.rows[0];
        user["max_xp"] = xpRequiredForLevel(user.level);
        res.json(user);
    } catch (err) {
        next(err);
    }
};

const getXpRequired = async (req, res, next) => {
    try {
        const userId = req.userId;
        const result = await pool.query(
            "SELECT level FROM users WHERE id = $1",
            [userId]
        );

        if (result.rows.length === 0) {
            const error = new Error("User not found");
            error.statusCode = 404;
            return next(error);
        }
        const userLevel = result.rows[0].level;
        const xpRequired = xpRequiredForLevel(userLevel);
        res.json({ xpRequired });
    } catch (err) {
        next(err);
    }
};

const getAllUsers = async (req, res, next) => {
    try {
        const result = await pool.query(
            "SELECT id, username, email, level, xp FROM users"
        );
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
};

module.exports = { register, login, getProfile, getXpRequired, getAllUsers };
