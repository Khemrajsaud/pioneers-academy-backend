import pool from "../config/db.js";
import cloudinary from "../config/cloudinary.js";
import multer from "multer";

const storage = multer.memoryStorage();
export const upload = multer({ storage });

// CREATE NEWS
export const createNews = async (req, res) => {
  try {
    const { title, description, category, published_by, published_date } = req.body;
    const file = req.file;

    let image_url = null;
    let image_key = null;

    if (file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "school-news" },
          (error, uploadedFile) => {
            if (error) reject(error);
            else resolve(uploadedFile);
          }
        );
        uploadStream.end(file.buffer);
      });

      image_url = result.secure_url;
      image_key = result.public_id;
    }

    const dbResult = await pool.query(
      `INSERT INTO news 
        (title, description, category, published_by, published_date, image_url, image_key)
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING *`,
      [title, description, category, published_by, published_date, image_url, image_key]
    );

    res.status(201).json(dbResult.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating news" });
  }
};

// GET ALL NEWS
export const getAllNews = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM news ORDER BY published_date DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching news" });
  }
};

// UPDATE NEWS
export const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, published_by, published_date } = req.body;
    const file = req.file;

    const existing = await pool.query("SELECT * FROM news WHERE id = $1", [id]);
    if (!existing.rows.length) return res.status(404).json({ message: "News not found" });

    let image_url = existing.rows[0].image_url;
    let image_key = existing.rows[0].image_key;

    if (file) {
      if (image_key) {
        await cloudinary.uploader.destroy(image_key);
      }

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "school-news" },
          (error, uploadedFile) => {
            if (error) reject(error);
            else resolve(uploadedFile);
          }
        );
        uploadStream.end(file.buffer);
      });

      image_url = result.secure_url;
      image_key = result.public_id;
    }

    const updated = await pool.query(
      `UPDATE news 
       SET title=$1, description=$2, category=$3, published_by=$4, published_date=$5, image_url=$6, image_key=$7
       WHERE id=$8
       RETURNING *`,
      [title, description, category, published_by, published_date, image_url, image_key, id]
    );

    res.json(updated.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating news" });
  }
};

// DELETE NEWS
export const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM news WHERE id = $1", [id]);
    if (!result.rows.length) return res.status(404).json({ message: "News not found" });

    const newsItem = result.rows[0];
    if (newsItem.image_key) {
      await cloudinary.uploader.destroy(newsItem.image_key);
    }

    await pool.query("DELETE FROM news WHERE id = $1", [id]);
    res.json({ message: "Deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Error deleting news" });
  }
};