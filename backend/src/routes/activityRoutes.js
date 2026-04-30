import express from "express";
import { 
    addActivity, 
    getAllActivities, 
    addParticipant,
    updateActivity,
    deleteActivity,
    getActivityStats,
    getLeaderboard
} from "../controllers/activityController.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";
import Activity from "../models/ActivitySchema.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/", getAllActivities);
router.post("/", authorizeRoles("admin", "staff", "faculty", "hr", "hod"), addActivity);
router.put("/:id", authorizeRoles("admin", "staff", "faculty", "hr", "hod"), updateActivity);
router.delete("/:id", authorizeRoles("admin", "staff", "faculty", "hr", "hod"), deleteActivity);
router.post("/participant", authorizeRoles("admin", "staff", "faculty", "hr", "hod"), addParticipant);
router.post("/participation", authorizeRoles("admin", "staff", "faculty"), addParticipant);
router.get("/student/:studentId", async (req, res) => {
    try {
        const activities = await Activity.find({ "participants.student": req.params.studentId });
        return res.status(200).json(activities);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching student participation", error: error.message });
    }
});
router.get("/stats", async (_req, res) => {
    try {
        const activities = await Activity.find({}, "participants");
        const totalActivities = activities.length;
        const totalParticipants = activities.reduce((acc, a) => acc + (a.participants?.length || 0), 0);
        const upcomingEvents = await Activity.countDocuments({ date: { $gte: new Date() } });
        return res.status(200).json({
            totalActivities,
            totalParticipants,
            totalEvents: totalActivities,
            upcomingEvents,
            activeClubs: 0,
            thisSemester: "Current semester",
            newParticipants: 0
        });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching activity stats", error: error.message });
    }
});
router.get("/leaderboard", async (_req, res) => {
    try {
        const activities = await Activity.find({}, "participants").populate({
            path: "participants.student",
            populate: { path: "user", select: "name profilePicture" }
        });
        const leaderboardMap = new Map();
        activities.forEach((activity) => {
            (activity.participants || []).forEach((p) => {
                const studentDoc = p.student;
                const key = String(studentDoc?._id || studentDoc || "");
                if (!key) return;
                const current = leaderboardMap.get(key) || {
                    studentId: key,
                    name: studentDoc?.user?.name || "Student",
                    avatar: studentDoc?.user?.profilePicture || "",
                    points: 0
                };
                current.points += 1;
                leaderboardMap.set(key, current);
            });
        });
        const leaderboard = Array.from(leaderboardMap.entries())
            .map(([, value]) => value)
            .sort((a, b) => b.points - a.points);
        return res.status(200).json(leaderboard);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching leaderboard", error: error.message });
    }
});

export default router;
