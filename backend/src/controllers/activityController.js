import Activity from "../models/ActivitySchema.js";

// Add new activity
export const addActivity = async (req, res) => {
    try {
        const activity = new Activity(req.body);
        await activity.save();
        res.status(201).json({ message: "Activity added successfully", activity });
    } catch (error) {
        res.status(500).json({ message: "Error adding activity", error: error.message });
    }
};

// Get all activities
export const getAllActivities = async (req, res) => {
    try {
        const activities = await Activity.find().populate("participants.student");
        res.status(200).json(activities);
    } catch (error) {
        res.status(500).json({ message: "Error fetching activities", error: error.message });
    }
};

// Update activity
export const updateActivity = async (req, res) => {
    try {
        const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!activity) return res.status(404).json({ message: "Activity not found" });
        res.status(200).json({ message: "Activity updated successfully", activity });
    } catch (error) {
        res.status(500).json({ message: "Error updating activity", error: error.message });
    }
};

// Delete activity
export const deleteActivity = async (req, res) => {
    try {
        const activity = await Activity.findByIdAndDelete(req.params.id);
        if (!activity) return res.status(404).json({ message: "Activity not found" });
        res.status(200).json({ message: "Activity deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting activity", error: error.message });
    }
};

// Get activity stats
export const getActivityStats = async (req, res) => {
    try {
        const [totalEvents, upcomingEvents] = await Promise.all([
            Activity.countDocuments(),
            Activity.countDocuments({ date: { $gte: new Date() } })
        ]);
        res.status(200).json({ totalEvents, upcomingEvents });
    } catch (error) {
        res.status(500).json({ message: "Error fetching activity stats", error: error.message });
    }
};

// Get leaderboard
export const getLeaderboard = async (req, res) => {
    try {
        // Simple logic for leaderboard: students with most participations
        const leaderboard = await Activity.aggregate([
            { $unwind: "$participants" },
            { $group: { _id: "$participants.student", points: { $sum: 10 } } },
            { $sort: { points: -1 } },
            { $limit: 10 }
        ]);
        
        // Populate student names
        // This is a simplified version
        res.status(200).json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: "Error fetching leaderboard", error: error.message });
    }
};

// Add participant to activity
export const addParticipant = async (req, res) => {
    const { activityId, studentId, role, remarks } = req.body;
    try {
        const activity = await Activity.findById(activityId);
        if (!activity) return res.status(404).json({ message: "Activity not found" });

        activity.participants.push({ student: studentId, role, remarks });
        await activity.save();

        res.status(200).json({ message: "Participant added successfully", activity });
    } catch (error) {
        res.status(500).json({ message: "Error adding participant", error: error.message });
    }
};
