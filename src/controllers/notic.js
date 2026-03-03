import pool from "../config/db.js";

// Get all notices
export const getNotices = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM notice ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single notice by ID
export const getNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM notice WHERE id = $1", [id]);
    if (!result.rows[0])
      return res.status(404).json({ message: "Notice not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new notice
export const createNotice = async (req, res) => {
  try {
    const { title, description, document_url, author, notice_date } = req.body;

    const result = await pool.query(
      `INSERT INTO notice (title, description, document_url, author, notice_date) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, description, document_url || null, author || "Admin", notice_date || new Date()]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a notice
export const updateNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, document_url, author, notice_date } = req.body;

    const result = await pool.query(
      `UPDATE notice 
       SET title=$1, description=$2, document_url=$3, author=$4, notice_date=$5 
       WHERE id=$6 RETURNING *`,
      [title, description, document_url || null, author || "Admin", notice_date || new Date(), id]
    );

    if (!result.rows[0])
      return res.status(404).json({ message: "Notice not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
   
  }
};

// Delete a notice
export const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM notice WHERE id=$1 RETURNING *",
      [id]
    );
    if (!result.rows[0])
      return res.status(404).json({ message: "Notice not found" });

    res.json({ message: "Notice deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};