import express from "express";
import {
    uploadResult,
    getStudentResults,
    getExamResults
} from "../controllers/resultController.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/", authorizeRoles("admin", "faculty"), uploadResult);
router.get("/student/:studentId", authorizeRoles("admin", "faculty", "student"), getStudentResults);
router.get("/exam/:examId", authorizeRoles("admin", "faculty"), getExamResults);

export default router;
