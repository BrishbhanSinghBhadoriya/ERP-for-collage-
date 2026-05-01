import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { 
    createHostelLeave, 
    getHostelLeaves, 
    approveByWarden, 
    approveByHOD, 
    finalForwardByWarden 
} from "../controllers/hostelLeaveController.js";

const router = express.Router();

router.post("/", authenticateToken, createHostelLeave);
router.get("/", authenticateToken, getHostelLeaves);
router.put("/approve-warden", authenticateToken, approveByWarden);
router.put("/approve-hod", authenticateToken, approveByHOD);
router.put("/final-forward", authenticateToken, finalForwardByWarden);

export default router;
