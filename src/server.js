// // src/server.js
// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import pool from './config/db.js'; // DB connection

// dotenv.config();

// const app = express(); // Create Express app

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Test DB connection
// pool.query("SELECT NOW()")
//   .then(res => console.log("DB time:", res.rows[0]))
//   .catch(err => console.error("DB Query Error ❌", err));

// // Test route
// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });



// src/server.js
import dotenv from 'dotenv';
import app from './app.js';         // Import the app
import pool from './config/db.js';  // DB connection

dotenv.config();

// Test DB connection
pool.query("SELECT NOW()")
  .then(res => console.log("DB time:", res.rows[0]))
  .catch(err => console.error("DB Query Error ❌", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});