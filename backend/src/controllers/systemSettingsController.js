import SystemSettings from "../models/SystemSettings.js";

export const getSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const setting = await SystemSettings.findOne({ key });
        res.status(200).json(setting ? setting.value : null);
    } catch (error) {
        res.status(500).json({ message: "Error fetching setting", error: error.message });
    }
};

export const updateSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;
        
        const setting = await SystemSettings.findOneAndUpdate(
            { key },
            { value, updatedBy: req.user?._id },
            { upsert: true, new: true }
        );
        
        res.status(200).json(setting.value);
    } catch (error) {
        res.status(500).json({ message: "Error updating setting", error: error.message });
    }
};

export const getAllSettings = async (req, res) => {
    try {
        const settings = await SystemSettings.find();
        const settingsMap = {};
        settings.forEach(s => {
            settingsMap[s.key] = s.value;
        });
        res.status(200).json(settingsMap);
    } catch (error) {
        res.status(500).json({ message: "Error fetching settings", error: error.message });
    }
};
