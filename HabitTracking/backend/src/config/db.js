const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// conn test
// pool.on("connect", () => {
//   console.log("Database connected");
// });

pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
    process.exit(-1);
});

// create following tables if not exists
// user (id,username, email, password, created_at)
// quest (id, user_id (reference key), quest_type ENUM {DAILY_QUEST, PENALTY}, title, description, quest_duration (in hours), created_at)
// quest_log (id, user_id (reference key), quest_id (reference key), status ENUM {PENDING, COMPLETED, FAILED}, assigned_at, complete_by)

// now create the tables
const createTables = async () => {
    const client = await pool.connect();
    try {
        await client.query(`
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            level INT DEFAULT 1,
            xp INT DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS quests (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            quest_type VARCHAR(20) NOT NULL,
            title VARCHAR(100) NOT NULL,
            description TEXT,
            quest_duration INT NOT NULL,
            quest_xp INT NOT NULL,
            failed_xp INT DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS quest_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id),
            quest_id UUID REFERENCES quests(id),
            status VARCHAR(20) DEFAULT 'PENDING',
            assigned_at TIMESTAMPTZ DEFAULT NOW(),
            complete_by TIMESTAMPTZ
        );

        CREATE UNIQUE INDEX IF NOT EXISTS one_pending_quest_per_user
        ON quest_logs (user_id, quest_id)
        WHERE status = 'PENDING';

    `);
        console.log("Tables are created or already exist.");
    } catch (err) {
        console.error("Error creating tables:", err);
    } finally {
        client.release();
    }
};

createTables();


module.exports = pool;