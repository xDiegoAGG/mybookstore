import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const useSsl = process.env.PGSSL === "true" || process.env.NODE_ENV === "production";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});
