import express from "express";
import { saveSdkLog } from "../controllers/sdkController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// SDK Telemetry Log
router.post(
  "/log",
  authMiddleware,
  saveSdkLog
);

export default router;