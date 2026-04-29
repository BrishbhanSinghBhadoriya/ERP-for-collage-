import express from "express";
import { 
    admitStudent, 
    getAllStudents, 
    getStudentById, 
    updateStudent, 
    deleteStudent 
} from "../controllers/studentController.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// All student routes require authentication
router.use(authenticateToken);

// Registrar, HOD, and Admin can admit and manage students
router.post("/", authorizeRoles("admin", "registrar", "hod", "hr"), admitStudent);
router.get("/", authorizeRoles("admin", "registrar", "faculty", "hod", "professor", "assistant professor", "staff", "hr", "manager", "employee", "bursar"), getAllStudents);
router.get("/:id", authorizeRoles("admin", "registrar", "faculty", "student", "hod", "professor", "assistant professor", "staff", "hr", "manager", "employee", "bursar"), getStudentById);
router.put("/:id", authorizeRoles("admin", "registrar", "hod", "hr"), updateStudent);
router.delete("/:id", authorizeRoles("admin", "registrar", "hod", "hr"), deleteStudent);


export default router;
