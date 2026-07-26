import { Pool } from "pg";
import { config } from "../config/env";

const pool = new Pool({
  user: config.dbUser,
  database: config.dbName,
});

pool.on("error", (err) => {
  console.error("Unexpected database error:", err);
});

export default pool;
