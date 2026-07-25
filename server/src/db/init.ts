// We need the Pool class from "pg" to connect to PostgreSQL.
// We'll use it twice: once as an admin to create the database, and once as a regular user to create tables.
import { Pool } from "pg";

// We need dotenv to load environment variables from the .env file.
import dotenv from "dotenv";

// Load the .env file so we can read DB_USER, DB_NAME, etc.
dotenv.config();

// This is the main function that sets up the entire database from scratch.
// "async" means this function can use "await" inside it — which lets us wait for
// database operations to finish before moving on to the next step.
// "Promise<void>" means "this function returns a promise that resolves to nothing (undefined)."
// Think of a Promise like a receipt — it's a promise that the work will eventually be done.
async function initDB(): Promise<void> {

  // First, we connect to PostgreSQL's built-in "postgres" database.
  // This is like connecting to the "front desk" of a hotel — you need this special connection
  // to create new databases. You can't create a database while connected to one that doesn't exist yet.
  const adminPool = new Pool({
    // The username to connect as (read from .env, or defaults to "postgres").
    user: process.env.DB_USER || "postgres",
    // We connect to the default "postgres" database, which always exists.
    // This is NOT our "dad_jokes" database — it's a system database that lets us create new ones.
    database: "postgres",
  });

  // What should our database be called? We read it from .env, or default to "dad_jokes".
  const dbName = process.env.DB_NAME || "dad_jokes";

  // The "try" block is where we do our work. If anything goes wrong, the "catch" block handles it.
  // The "finally" block ALWAYS runs — whether things succeeded or failed.
  // This is important because we ALWAYS want to close our admin connection when we're done.
  try {
    // This SQL query asks PostgreSQL: "Does a database with this name already exist?"
    // "SELECT 1" just picks a dummy value — we don't care about the value, we care about whether ANY rows come back.
    // "FROM pg_database" is PostgreSQL's built-in list of all databases.
    // "WHERE datname = $1" filters to only the database whose name matches our variable.
    // The $1 is a "parameter placeholder" — it's replaced by [dbName] safely, preventing SQL injection attacks.
    const exists = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );

    // If "exists.rows" has 0 items, that means the database does NOT exist yet.
    if (exists.rows.length === 0) {
      // Create the database! This is like building a new filing cabinet.
      // We use a template string (backticks ``) to insert the database name into the SQL.
      // NOTE: We can't use $1 here because CREATE DATABASE doesn't support parameterized names.
      // This is okay because dbName comes from our .env file, not from user input.
      await adminPool.query(`CREATE DATABASE ${dbName}`);
      // Let the developer know the database was created successfully.
      console.log(`Database "${dbName}" created.`);
    } else {
      // The database already exists! No need to create it again.
      // This is like checking if the filing cabinet is already there before building another one.
      console.log(`Database "${dbName}" already exists.`);
    }
  } finally {
    // NO MATTER what happened (success or error), close the admin connection.
    // Leaving connections open wastes resources — like leaving a phone off the hook.
    await adminPool.end();
  }

  // Now that the database exists, we need to connect to OUR specific database
  // and create the tables inside it. This is a separate connection pool.
  const appPool = new Pool({
    // Same username as before.
    user: process.env.DB_USER || "postgres",
    // But NOW we connect to our actual "dad_jokes" database (not "postgres").
    database: dbName,
  });

  try {
    // This big SQL string creates our tables and indexes.
    // "CREATE TABLE IF NOT EXISTS" means "make this table, but don't error if it already exists."
    // Think of a table like a spreadsheet — it has columns (like headers) and rows (like data entries).
    await appPool.query(`
      CREATE TABLE IF NOT EXISTS jokes (
        // "id SERIAL PRIMARY KEY" means:
        // - id: the column name
        // - SERIAL: automatically generates a unique number for each new row (1, 2, 3, 4...)
        // - PRIMARY KEY: this is the unique identifier — no two rows can have the same id.
        // It's like each joke gets a unique ticket number.
        id SERIAL PRIMARY KEY,
        // "setup TEXT NOT NULL" means:
        // - The setup can be any length of text (short or long).
        // - NOT NULL means this field CANNOT be empty — every joke MUST have a setup.
        setup TEXT NOT NULL,
        // Same for punchline — every joke must have a punchline, and it can be any length.
        punchline TEXT NOT NULL,
        // "VARCHAR(50)" means the category can be up to 50 characters long.
        // "DEFAULT 'classic'" means if no category is provided, use "classic" automatically.
        category VARCHAR(50) DEFAULT 'classic',
        // "INTEGER DEFAULT 5" means a whole number that defaults to 5.
        // "CHECK (groan_level >= 1 AND groan_level <= 10)" means the database will REJECT
        // any value outside the range 1-10. It's like a bouncer at a club — only valid numbers get in.
        groan_level INTEGER DEFAULT 5 CHECK (groan_level >= 1 AND groan_level <= 10),
        // Upvotes start at 0. They go up by 1 each time someone likes the joke.
        upvotes INTEGER DEFAULT 0,
        // Downvotes also start at 0. They go up by 1 each time someone dislikes the joke.
        downvotes INTEGER DEFAULT 0,
        // The author's name can be up to 100 characters. If no name is given, it defaults to "Anonymous Dad".
        author VARCHAR(100) DEFAULT 'Anonymous Dad',
        // "TIMESTAMP DEFAULT CURRENT_TIMESTAMP" means:
        // Automatically records the exact date and time when this joke was inserted into the database.
        // We don't have to set this manually — the database does it for us.
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS votes (
        id SERIAL PRIMARY KEY,
        // "REFERENCES jokes(id) ON DELETE CASCADE" means:
        // - This column links to the "id" column in the "jokes" table.
        // - "ON DELETE CASCADE" means: if a joke is deleted, automatically delete all its votes too.
        // This keeps things clean — no orphan votes pointing to deleted jokes.
        joke_id INTEGER REFERENCES jokes(id) ON DELETE CASCADE,
        // The vote type can only be 'up' or 'down' — nothing else is allowed.
        // "CHECK (vote_type IN ('up', 'down'))" enforces this rule in the database itself.
        vote_type VARCHAR(4) NOT NULL CHECK (vote_type IN ('up', 'down')),
        // When was this vote cast? Automatically recorded.
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      // INDEXES are like a table of contents in a book — they help the database find data faster.
      // Without indexes, the database would have to scan every single row (like reading every page).
      // "CREATE INDEX IF NOT EXISTS" means: make this index, but don't error if it already exists.
      // This index speeds up searches by "category" (e.g., "give me all puns").
      CREATE INDEX IF NOT EXISTS idx_jokes_category ON jokes(category),
      // This index speeds up sorting/filtering by "groan_level" (e.g., "give me the groaniest jokes").
      CREATE INDEX IF NOT EXISTS idx_jokes_groan_level ON jokes(groan_level),
      // This index speeds up looking up all votes for a specific joke.
      // When you click on a joke and want to see its votes, this makes it fast.
      CREATE INDEX IF NOT EXISTS idx_votes_joke_id ON votes(joke_id);
    `);

    // Let the developer know everything was set up successfully.
    console.log("Tables and indexes created successfully.");
  } finally {
    // Always close this connection too — we're done with it.
    await appPool.end();
  }
}

// Now we actually RUN the initDB() function we defined above.
// ".then()" runs after initDB() finishes successfully.
initDB()
  .then(() => {
    // Everything went well — print a success message.
    console.log("Database initialization complete.");
    // Exit the process with code 0. In programming, exit code 0 means "everything is fine."
    // This is like a traffic light turning green — all clear.
    process.exit(0);
  })
  // ".catch()" runs if initDB() encounters an error.
  .catch((err) => {
    // Print the error so the developer can see what went wrong.
    console.error("Database initialization failed:", err);
    // Exit with code 1. Exit code 1 means "something went wrong."
    // This is like a traffic light turning red — stop, there's a problem.
    process.exit(1);
  });
