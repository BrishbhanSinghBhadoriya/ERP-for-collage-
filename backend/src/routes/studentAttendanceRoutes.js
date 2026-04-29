import express from "express";
import {
    markAttendance,
    bulkMarkAttendance,
    getStudentAttendance,
    getClassAttendance,
    getStudentAttendanceReport
} from "../controllers/studentAttendanceController.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// All attendance routes require authentication
router.use(authenticateToken);

// Faculty, HOD, Professor, Assistant Professor, Admin and HR can mark attendance
router.post("/", authorizeRoles("admin", "faculty", "hod", "professor", "assistant professor", "hr"), markAttendance);
router.post("/bulk", authorizeRoles("admin", "faculty", "hod", "professor", "assistant professor", "hr"), bulkMarkAttendance);

// Faculty/Admin/HR can view class attendance
router.get("/class", authorizeRoles("admin", "faculty", "hod", "professor", "assistant professor", "hr"), getClassAttendance);

// Students can view their own attendance, Faculty/Admin/HR can view any student's attendance
router.get("/student/:studentId", authorizeRoles("admin", "faculty", "student", "hod", "professor", "assistant professor", "staff", "hr"), getStudentAttendance);
router.get("/report/:studentId", authorizeRoles("admin", "faculty", "student", "hod", "professor", "assistant professor", "staff", "hr"), getStudentAttendanceReport);

export default router;
