import { register, login, logout, getUserProfile, getMe } from "../controllers/authController.js";
import express from "express";
import { authenticateToken, allowInitialAdminOrAuthorizedCreator } from "../middleware/auth.js";
import { updateEmployee, getDashboardData, getEmployeebypagination, importEmployeesFromExcel } from "../controllers/employeeController.js";
import { enforceLoginRestrictions } from "../middleware/loginRestrictions.js";
import { SendforgetPasswordRequest } from "../controllers/employeeController.js";
import { checkEmailExist } from "../controllers/employeeController.js";
import { uploadExcelFile } from "../middleware/excelUpload.js";
import { registerValidation, loginValidation } from "../middleware/validator.js";



const router = express.Router();

// Public routes
router.post("/login",enforceLoginRestrictions, loginValidation, login);

// Routes that allow registration (can be restricted to HR/Admin if needed)
router.post("/register", allowInitialAdminOrAuthorizedCreator, registerValidation, register);

// Protected routes (require authentication)
router.post("/logout", authenticateToken, logout);
router.get("/me", authenticateToken, getMe);
router.get("/profile", authenticateToken, getUserProfile);
router.put("/profile/update", authenticateToken, updateEmployee);
router.put("/employee/:id", authenticateToken, updateEmployee);
router.get("/getEmployeesbypagination", authenticateToken, getEmployeebypagination);
router.get("/getDashboard", authenticateToken, getDashboardData);
router.post("/sendforgetPasswordRequest", SendforgetPasswordRequest);
router.post("/check-user-exist-with-Email", checkEmailExist)
router.post("/import-employees", authenticateToken, uploadExcelFile, importEmployeesFromExcel);

export default router;
