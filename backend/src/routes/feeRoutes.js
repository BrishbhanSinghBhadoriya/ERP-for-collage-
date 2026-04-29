import express from "express";
import {
    createFeeRecord,
    processPayment,
    getAllFees,
    getStudentFees,
    getPendingFeesReport,
    getFeeTransactions,
    getFeeStats,
    collectFee
} from "../controllers/feeController.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// All fee routes require authentication
router.use(authenticateToken);

// Admin/HR/HOD/Bursar/Staff can manage fees
const feeManageRoles = ["admin", "bursar", "staff", "hr", "hod"];
router.post("/", authorizeRoles(...feeManageRoles), createFeeRecord);
router.get("/", authorizeRoles(...feeManageRoles), getAllFees);
router.get("/report/pending", authorizeRoles(...feeManageRoles), getPendingFeesReport);
router.get("/report", authorizeRoles(...feeManageRoles), getPendingFeesReport);
router.get("/transactions", authorizeRoles(...feeManageRoles), getFeeTransactions);
router.get("/stats", authorizeRoles(...feeManageRoles), getFeeStats);

// Process payment (can be called by student or staff/bursar/admin/hr)
router.put("/pay/:id", authorizeRoles("admin", "bursar", "staff", "student", "hr", "hod"), processPayment);
router.post("/collect", authorizeRoles("admin", "bursar", "staff", "student", "hr", "hod"), collectFee);

// View student fees
router.get("/student/:studentId", authorizeRoles("admin", "bursar", "staff", "student", "hr", "hod"), getStudentFees);

export default router;
