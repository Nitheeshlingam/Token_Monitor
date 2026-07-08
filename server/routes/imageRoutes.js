import express from "express";
import upload from "../middleware/upload.js";
import { analyzeImage } from "../controllers/imageController.js";

const router = express.Router();

router.post("/upload", upload.single("image"), analyzeImage);

export default router;