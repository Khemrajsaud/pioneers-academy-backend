// src/config/db.js
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

try {
  await pool.connect();
  console.log("PostgreSQL Connected ✅");
} catch (err) {
  console.error("DB Connection Error ❌", err);
}

export default pool; // <- now using ES module