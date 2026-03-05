import pool from "../config/db.js";
import cloudinary from "../config/cloudinary.js";

let hasUploadedDateColumnCache = null;

const hasUploadedDateColumn = async () => {
  if (hasUploadedDateColumnCache !== null) return hasUploadedDateColumnCache;

  const result = await pool.query(
    `SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'resources' AND column_name = 'uploaded_date'
    ) AS exists`
  );

  hasUploadedDateColumnCache = result.rows[0]?.exists === true;
  return hasUploadedDateColumnCache;
};

// Upload Resource
export const uploadResource = async (req, res) => {
  try {
    const { title, uploaded_date } = req.body;
    const file = req.file;

    if (!title || !file) {
      return res.status(400).json({ message: "Title and file are required" });
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: "raw", folder: "resources" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(file.buffer);
    });

    const hasUploadedDate = await hasUploadedDateColumn();

    const db = hasUploadedDate
      ? await pool.query(
          `INSERT INTO resources (title, file_url, file_public_id, uploaded_date)
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [title, result.secure_url, result.public_id, uploaded_date || new Date()]
        )
      : await pool.query(
          `INSERT INTO resources (title, file_url, file_public_id)
           VALUES ($1, $2, $3) RETURNING *`,
          [title, result.secure_url, result.public_id]
        );

    res.json(db.rows[0]);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

// Get All Resources
export const getResources = async (req, res) => {
  try {
    const hasUploadedDate = await hasUploadedDateColumn();
    const orderByColumn = hasUploadedDate ? "uploaded_date" : "created_at";

    const result = await pool.query(`SELECT * FROM resources ORDER BY ${orderByColumn} DESC`);
    res.json(result.rows);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ message: "Failed to fetch resources" });
  }
};

// Delete Resource
export const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await pool.query(
      "SELECT * FROM resources WHERE id=$1",
      [id]
    );

    if (!resource.rows[0]) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const file = resource.rows[0];

    if (file.file_public_id) {
      await cloudinary.uploader.destroy(file.file_public_id, {
        resource_type: "raw",
      });
    }

    await pool.query("DELETE FROM resources WHERE id=$1", [id]);

    res.json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Failed to delete resource", error: error.message });
  }
};

// Update Resource
export const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, uploaded_date } = req.body;
    const file = req.file;

    const resource = await pool.query(
      "SELECT * FROM resources WHERE id=$1",
      [id]
    );

    if (!resource.rows[0]) {
      return res.status(404).json({ message: "Resource not found" });
    }

    let file_url = resource.rows[0].file_url;
    let file_public_id = resource.rows[0].file_public_id;

    if (file) {
      if (file_public_id) {
        await cloudinary.uploader.destroy(file_public_id, { resource_type: "raw" });
      }

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { resource_type: "raw", folder: "resources" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(file.buffer);
      });

      file_url = result.secure_url;
      file_public_id = result.public_id;
    }

    const hasUploadedDate = await hasUploadedDateColumn();

    const db = hasUploadedDate
      ? await pool.query(
          `UPDATE resources
           SET title=$1,
               file_url=$2,
               file_public_id=$3,
               uploaded_date=$4,
               updated_at=NOW()
           WHERE id=$5
           RETURNING *`,
          [
            title || resource.rows[0].title,
            file_url,
            file_public_id,
            uploaded_date || resource.rows[0].uploaded_date || resource.rows[0].created_at,
            id,
          ]
        )
      : await pool.query(
          `UPDATE resources
           SET title=$1,
               file_url=$2,
               file_public_id=$3,
               updated_at=NOW()
           WHERE id=$4
           RETURNING *`,
          [
            title || resource.rows[0].title,
            file_url,
            file_public_id,
            id,
          ]
        );

    res.json(db.rows[0]);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Failed to update resource", error: error.message });
  }
};