import express from "express";
import {
  getNotices,
  getNotice,
  createNotice,
  updateNotice,
  deleteNotice
} from "../controllers/notic.js";

const router = express.Router();

router.get("/", getNotices);
router.get("/:id", getNotice);
router.post("/", createNotice);
router.put("/:id", updateNotice);
router.delete("/:id", deleteNotice);

export default router;