import express from "express";
import { 
    getAllHolidays, 
    createHoliday, 
    updateHoliday, 
    deleteHoliday 
} from "../controllers/holidayController.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/", getAllHolidays);
router.post("/", authorizeRoles("admin", "hr"), createHoliday);
router.put("/:id", authorizeRoles("admin", "hr"), updateHoliday);
router.delete("/:id", authorizeRoles("admin", "hr"), deleteHoliday);

export default router;
