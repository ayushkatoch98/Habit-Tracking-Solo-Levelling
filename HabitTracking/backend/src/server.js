require("dotenv").config();
const validateEnv = require("./config/env");
const app = require("./app");

// Validate environment variables
validateEnv();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger: http://localhost:${PORT}/api/docs`);
  
});
