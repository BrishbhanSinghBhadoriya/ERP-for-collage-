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
