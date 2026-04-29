import express from "express";
import { 
  getDashboardStats, 
  getDashboardTrends, 
  getRecentAdmissions,
  getRecentActivities,
  getStudentDashboard
} from "../controllers/dashboardController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/stats", authenticateToken, getDashboardStats);
router.get("/trends", authenticateToken, getDashboardTrends);
router.get("/recent-admissions", authenticateToken, getRecentAdmissions);
router.get("/recent-activities", authenticateToken, getRecentActivities);
router.get("/student/:studentId", authenticateToken, getStudentDashboard);

export default router;
