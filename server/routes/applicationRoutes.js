import express from "express";

import {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  regenerateSdkKey,
  deleteApplication,
} from "../controllers/applicationController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Application
router.post("/", authMiddleware, createApplication);

router.get("/", authMiddleware, getApplications);

router.get("/:id", authMiddleware, getApplicationById);

router.put("/:id", authMiddleware, updateApplication);

router.patch("/:id/regenerate-key", authMiddleware, regenerateSdkKey);

router.delete("/:id", authMiddleware, deleteApplication);

export default router;