import express from "express";
import {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    getDepartments,
    createSubject,
    getAllSubjects,
    getSubjectsByCourse,
    updateSubject,
    deleteSubject,
    getCourseStats
} from "../controllers/academicsController.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// All academics routes require authentication
router.use(authenticateToken);

// Course Routes
router.post("/courses", authorizeRoles("admin", "registrar", "hod"), createCourse);
router.get("/courses", getAllCourses);
router.get("/courses/departments", getDepartments);
router.get("/courses/stats", getCourseStats);
router.get("/courses/:id", getCourseById);
router.put("/courses/:id", authorizeRoles("admin", "registrar", "hod"), updateCourse);
router.delete("/courses/:id", authorizeRoles("admin", "registrar", "hod"), deleteCourse);

// Subject Routes
router.post("/subjects", authorizeRoles("admin", "registrar", "hod"), createSubject);
router.get("/subjects", getAllSubjects);
router.get("/subjects/course/:courseId", getSubjectsByCourse);
router.put("/subjects/:id", authorizeRoles("admin", "registrar", "hod"), updateSubject);
router.delete("/subjects/:id", authorizeRoles("admin", "registrar", "hod"), deleteSubject);

export default router;
