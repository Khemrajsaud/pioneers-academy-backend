import pool from "../config/db.js";
import cloudinary from "../config/cloudinary.js";

export const createGalleryImage = async (req, res) => {
  try {
    const { title } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      { folder: "school_gallery" },
      async (error, uploaded) => {
        if (error) {
          return res.status(500).json({ message: "Cloudinary upload failed" });
        }

        // Save in database
        const dbResult = await pool.query(
          "INSERT INTO gallery (title, image_url, image_key) VALUES ($1, $2, $3) RETURNING *",
          [title, uploaded.secure_url, uploaded.public_id]
        );

        res.status(201).json(dbResult.rows[0]);
      }
    );

    result.end(req.file.buffer);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getGallery = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM gallery ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM gallery WHERE id=$1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Image not found" });
    }

    const image = result.rows[0];

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(image.image_key);

    // Delete from DB
    await pool.query("DELETE FROM gallery WHERE id=$1", [id]);

    res.json({ message: "Image deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};