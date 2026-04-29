import Holiday from "../models/HolidaySchema.js";

export const getAllHolidays = async (req, res) => {
    try {
        const holidays = await Holiday.find().sort({ date: 1 });
        res.status(200).json(holidays);
    } catch (error) {
        res.status(500).json({ message: "Error fetching holidays", error: error.message });
    }
};

export const createHoliday = async (req, res) => {
    try {
        const holiday = new Holiday(req.body);
        await holiday.save();
        res.status(201).json(holiday);
    } catch (error) {
        res.status(500).json({ message: "Error creating holiday", error: error.message });
    }
};

export const updateHoliday = async (req, res) => {
    try {
        const holiday = await Holiday.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!holiday) return res.status(404).json({ message: "Holiday not found" });
        res.status(200).json(holiday);
    } catch (error) {
        res.status(500).json({ message: "Error updating holiday", error: error.message });
    }
};

export const deleteHoliday = async (req, res) => {
    try {
        const holiday = await Holiday.findByIdAndDelete(req.params.id);
        if (!holiday) return res.status(404).json({ message: "Holiday not found" });
        res.status(200).json({ message: "Holiday deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting holiday", error: error.message });
    }
};
