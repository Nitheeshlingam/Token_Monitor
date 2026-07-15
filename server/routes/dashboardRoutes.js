import express from "express";
import {
  getSummary,
  getHistory,
  getDailyUsage,
  getModels,
  getDetails
} from "../controllers/dashboardController.js";
import {
    getApplicationDashboard
} from "../controllers/dashboardController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/history", getHistory);
router.get("/summary", getSummary);
router.get("/daily-usage", getDailyUsage);
router.get("/models", getModels);
router.get("/details", getDetails);
router.get(
    "/application/:id",
    authMiddleware,
    getApplicationDashboard
);
export default router;