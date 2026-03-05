import express from "express";
import upload from "../middleware/upload.js";
import {
  uploadResource,
  getResources,
  deleteResource,
  updateResource,
} from "../controllers/resources.js";

const router = express.Router();

router.post("/", upload.single("file"), uploadResource);
router.get("/", getResources);
router.put("/:id", upload.single("file"), updateResource);
router.delete("/:id", deleteResource);

export default router;