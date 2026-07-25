// We need the "Pool" class from the "pg" package.
// "pg" is a library that lets Node.js talk to PostgreSQL databases.
// A "Pool" is a group of database connections that get reused — like a taxi stand.
// Instead of hailing a new taxi every time (opening a brand new connection),
// you grab one from the stand (the pool), use it, and return it.
import { Pool } from "pg";

// We need "dotenv" so we can read environment variables from a .env file.
// Environment variables are like settings that live outside your code.
// This keeps sensitive info (like database passwords) out of your source code.
import dotenv from "dotenv";

// This line reads the .env file and loads all the variables in it
// into process.env so we can use them in our code.
// For example, if .env has DB_USER=postgres, then process.env.DB_USER becomes "postgres".
dotenv.config();

// Create a new connection pool — this is the main way we'll talk to the database.
const pool = new Pool({
  // Which database user are we connecting as?
  // We read this from the .env file. If it's not there, we fall back to "postgres"
  // (which is the default PostgreSQL user that comes pre-installed).
  // The "||" means "or" — so it's like saying "use the .env value, or if that's missing, use postgres".
  user: process.env.DB_USER || "postgres",
  // Which database are we connecting to? Each database is like a separate filing cabinet.
  // We want "dad_jokes" specifically. If the .env file doesn't specify one, we default to "dad_jokes".
  database: process.env.DB_NAME || "dad_jokes",
});

// This sets up a safety net for unexpected errors.
// Sometimes the database connection breaks for reasons you didn't anticipate (server restarts, etc.).
// This "error" event listener catches those surprises and prints them to the console
// instead of letting the whole app crash silently.
pool.on("error", (err) => {
  // Print the error message to the console so the developer can see something went wrong.
  console.error("Unexpected database error:", err);
});

// We export (share) this pool so other files can import and use it.
// This way, every file that needs the database uses the same pool
// instead of each one creating its own — like everyone sharing one phone line.
export default pool;
