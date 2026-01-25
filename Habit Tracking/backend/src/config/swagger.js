const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Habit Tracking – Solo Levelling API",
      version: "1.0.0",
      description: "Backend API for Quest-based Habit Tracker with RPG elements",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: process.env.API_URL || "http://localhost:5000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token obtained from login endpoint",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "User ID",
              example: 1,
            },
            username: {
              type: "string",
              description: "Username",
              example: "player1",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email",
              example: "player1@example.com",
            },
            level: {
              type: "integer",
              description: "User level",
              example: 1,
            },
            xp: {
              type: "integer",
              description: "User experience points",
              example: 0,
            },
          },
        },
        Quest: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Quest ID",
              example: 1,
            },
            user_id: {
              type: "integer",
              description: "User ID who owns the quest",
              example: 1,
            },
            title: {
              type: "string",
              description: "Quest title",
              example: "Complete morning workout",
            },
            description: {
              type: "string",
              description: "Quest description",
              example: "Do 30 minutes of exercise",
              nullable: true,
            },
            quest_type: {
              type: "string",
              enum: ["daily_quest", "penalty"],
              description: "Type of quest",
              example: "daily_quest",
            },
            xp_reward: {
              type: "integer",
              description: "XP reward for completing the quest",
              example: 10,
            },
            completed: {
              type: "boolean",
              description: "Quest completion status",
              example: false,
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Quest creation timestamp",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              description: "Quest last update timestamp",
            },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["username", "email", "password"],
          properties: {
            username: {
              type: "string",
              minLength: 3,
              maxLength: 50,
              description: "Username",
              example: "player1",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email",
              example: "player1@example.com",
            },
            password: {
              type: "string",
              minLength: 6,
              format: "password",
              description: "User password",
              example: "password123",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "User email",
              example: "player1@example.com",
            },
            password: {
              type: "string",
              format: "password",
              description: "User password",
              example: "password123",
            },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            token: {
              type: "string",
              description: "JWT authentication token",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            user: {
              $ref: "#/components/schemas/User",
            },
          },
        },
        QuestRequest: {
          type: "object",
          required: ["title", "quest_type"],
          properties: {
            title: {
              type: "string",
              minLength: 1,
              maxLength: 255,
              description: "Quest title",
              example: "Complete morning workout",
            },
            description: {
              type: "string",
              maxLength: 1000,
              description: "Quest description",
              example: "Do 30 minutes of exercise",
              nullable: true,
            },
            quest_type: {
              type: "string",
              enum: ["daily_quest", "penalty"],
              description: "Type of quest",
              example: "daily_quest",
            },
            xp_reward: {
              type: "integer",
              minimum: 1,
              description: "XP reward for completing the quest",
              example: 10,
              default: 10,
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Error message",
              example: "Error description",
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Authentication token is missing or invalid",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                message: "No token provided",
              },
            },
          },
        },
        NotFoundError: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                message: "Quest not found",
              },
            },
          },
        },
        ValidationError: {
          description: "Validation error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                message: "All fields required",
              },
            },
          },
        },
        ServerError: {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                message: "Server error",
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Auth",
        description: "Authentication endpoints",
      },
      {
        name: "Quests",
        description: "Quest management endpoints",
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

module.exports = swaggerJSDoc(options);

