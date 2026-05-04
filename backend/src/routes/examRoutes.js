import express from "express";
import {
    createExam,
    getAllExams,
    getExamsByCourse,
    updateExam,
    deleteExam,
    getUpcomingExams,
    getExamStats,
    getDateSheet
} from "../controllers/examController.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/", authorizeRoles("admin", "registrar", "faculty", "hr", "hod"), createExam);
router.get("/upcoming", getUpcomingExams);
router.get("/stats", getExamStats);
router.get("/date-sheet", getDateSheet);
router.get("/", getAllExams);
router.get("/course/:courseId", getExamsByCourse);
router.put("/:id", authorizeRoles("admin", "registrar", "hr", "hod"), updateExam);
router.delete("/:id", authorizeRoles("admin", "registrar", "hr", "hod"), deleteExam);

export default router;
