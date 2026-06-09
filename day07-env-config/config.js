require("dotenv").config();

const requiredEnvVars = ["JWT_SECRET", "DB_URL"];

// validate on startup — fail fast if something is missing
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET,
  dbUrl: process.env.DB_URL,
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || [],
  isDev: process.env.NODE_ENV === "development",
};
