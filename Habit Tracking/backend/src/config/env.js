const requiredEnvVars = [
  "DATABASE_URL",
  "JWT_SECRET",
];

const validateEnv = () => {
  const missing = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    console.error("Missing required environment variables:");
    missing.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    console.error("\nPlease set these variables in your .env file");
    process.exit(1);
  }  
  // console.log("Environment variables validated");
};

module.exports = validateEnv;

