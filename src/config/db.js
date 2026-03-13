// // src/config/db.js
// import pkg from "pg";
// import dotenv from "dotenv";

// dotenv.config();

// const { Pool } = pkg;

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });

// try {
//   await pool.connect();
//   console.log("PostgreSQL Connected ✅");
// } catch (err) {
//   console.error("DB Connection Error ❌", err);
// }

// export default pool; // <- now using ES module

import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// This line helps you debug. It will print the URL in your terminal.
console.log("Connecting to:", process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

try {
  const client = await pool.connect();
  console.log("PostgreSQL Connected ✅");
  client.release();
} catch (err) {
  console.error("DB Connection Error ❌", err);
}

export default pool;