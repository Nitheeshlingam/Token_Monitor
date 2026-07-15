import express from "express";

import upload from "../middleware/upload.js";
import authMiddleware from "../middleware/authMiddleware.js";
import verifySdk from "../middleware/verifySdk.js";

import {
    analyzeImage,
    getAvailableModels,
} from "../controllers/imageController.js";

const router = express.Router();

// Analyze Image
router.post(
    "/upload",
    authMiddleware,
    verifySdk,
    upload.single("image"),
    analyzeImage
);

// Get Available Models
router.get(
    "/models",
    getAvailableModels
);

export default router;