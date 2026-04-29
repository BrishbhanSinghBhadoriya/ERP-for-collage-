// routes/attendanceRoutes.js
// Path: unifost_hrms_backend/routes/attendanceRoutes.js

import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  markAttendance,
  getMonthlyAttendance,
} from "../controllers/attendanceController.js";

const router = express.Router();


router.post("/mark", authenticateToken, markAttendance);
router.get("/", authenticateToken, getMonthlyAttendance);
router.get("/report", authenticateToken, getMonthlyAttendance);

router.get("/monthly", authenticateToken, getMonthlyAttendance);

export default router;
