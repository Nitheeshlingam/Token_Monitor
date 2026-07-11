import express from "express";
import upload from "../middleware/upload.js";
import authMiddleware from "../middleware/authMiddleware.js";

import {
    analyzeImage,
    getAvailableModels,
} from "../controllers/imageController.js";

const router = express.Router();

router.post(
    "/upload",
    authMiddleware,
    upload.single("image"),
    analyzeImage
);

router.get("/models", getAvailableModels);

export default router;