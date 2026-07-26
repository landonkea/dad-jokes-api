// Validates that all required environment variables are set
// Fails fast with a clear error instead of mysterious crashes later
const required = ["DB_USER", "DB_NAME"] as const;

for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    console.error("Check your .env file or environment configuration.");
    process.exit(1);
  }
}

export const config = {
  dbUser: process.env.DB_USER!,
  dbName: process.env.DB_NAME!,
  dbHost: process.env.DB_HOST || "localhost",
  dbPort: parseInt(process.env.DB_PORT || "5432"),
  port: parseInt(process.env.PORT || "3001"),
} as const;
