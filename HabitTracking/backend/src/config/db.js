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
            timezone VARCHAR(64) DEFAULT 'Asia/Kolkata',
            reset_hour_utc INT DEFAULT 18,
            reset_minute_utc INT DEFAULT 30,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS quests (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            quest_type VARCHAR(20) NOT NULL,
            user_id UUID REFERENCES users(id),
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

        ALTER TABLE quest_logs
            ADD COLUMN IF NOT EXISTS assigned_date DATE
            GENERATED ALWAYS AS ((assigned_at AT TIME ZONE 'UTC')::date) STORED;

        CREATE UNIQUE INDEX IF NOT EXISTS one_pending_quest_per_user_day
        ON quest_logs (user_id, quest_id, assigned_date)
        WHERE status = 'PENDING';

        CREATE INDEX IF NOT EXISTS idx_quest_logs_user_status_assigned_at
        ON quest_logs (user_id, status, assigned_at DESC);

        ALTER TABLE users
            ADD COLUMN IF NOT EXISTS timezone VARCHAR(64) DEFAULT 'UTC';

        ALTER TABLE users
            ADD COLUMN IF NOT EXISTS reset_hour_utc INT DEFAULT 3;

        ALTER TABLE quests
            ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

        ALTER TABLE users
            ADD COLUMN IF NOT EXISTS reset_minute_utc INT DEFAULT 30;

        ALTER TABLE users
            ALTER COLUMN timezone SET DEFAULT 'Asia/Kolkata';

        ALTER TABLE users
            ALTER COLUMN reset_hour_utc SET DEFAULT 18;

        ALTER TABLE users
            ALTER COLUMN reset_minute_utc SET DEFAULT 30;

        UPDATE users
            SET reset_hour_utc = 18,
                reset_minute_utc = 30,
                timezone = COALESCE(timezone, 'Asia/Kolkata')
            WHERE reset_hour_utc IS NULL
               OR reset_minute_utc IS NULL
               OR reset_hour_utc = 3;

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
