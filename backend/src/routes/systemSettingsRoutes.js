import express from "express";
import { getSetting, updateSetting, getAllSettings } from "../controllers/systemSettingsController.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/", getAllSettings);
router.get("/:key", getSetting);
router.put("/:key", authorizeRoles("admin", "hr", "hod"), updateSetting);

export default router;
