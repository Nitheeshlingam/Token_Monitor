import express from "express";
import { getTodayDashboard } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/today", getTodayDashboard);

export default router;