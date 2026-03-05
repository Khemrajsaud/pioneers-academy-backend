import express from "express";
import {
  createNews,
  getAllNews,
  getNewsById,
  deleteNews,
  updateNews,
  incrementViewCount,
  upload,
} from "../controllers/news.js";

const router = express.Router();

router.post("/", upload.single("image"), createNews);
router.get("/:id", getNewsById);
router.get("/", getAllNews);
router.put("/:id", upload.single("image"), updateNews);
router.delete("/:id", deleteNews);
router.patch("/:id/view", incrementViewCount);

export default router;
