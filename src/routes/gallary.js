import express from "express";
import upload from "../middleware/upload.js";
import {
  createGalleryImage,
  getGallery,
  deleteGalleryImage,
} from "../controllers/gallary.js";

const router = express.Router();

router.post("/", upload.single("image"), createGalleryImage);
router.get("/", getGallery);
router.delete("/:id", deleteGalleryImage);

export default router;