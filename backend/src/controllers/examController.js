import Exam from "../models/ExamSchema.js";

export const createExam = async (req, res) => {
    try {
        const exam = new Exam(req.body);
        await exam.save();
        res.status(201).json(exam);
    } catch (error) {
        res.status(500).json({ message: "Error scheduling exam", error: error.message });
    }
};

export const getAllExams = async (req, res) => {
    try {
        const exams = await Exam.find().populate("course").populate("subject");
        res.status(200).json(exams);
    } catch (error) {
        res.status(500).json({ message: "Error fetching exams", error: error.message });
    }
};

export const getExamsByCourse = async (req, res) => {
    try {
        const exams = await Exam.find({ course: req.params.courseId }).populate("subject");
        res.status(200).json(exams);
    } catch (error) {
        res.status(500).json({ message: "Error fetching exams", error: error.message });
    }
};

export const updateExam = async (req, res) => {
    try {
        const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!exam) return res.status(404).json({ message: "Exam not found" });
        res.status(200).json(exam);
    } catch (error) {
        res.status(500).json({ message: "Error updating exam", error: error.message });
    }
};

export const deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findByIdAndDelete(req.params.id);
        if (!exam) return res.status(404).json({ message: "Exam not found" });
        res.status(200).json({ message: "Exam deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting exam", error: error.message });
    }
};

export const getUpcomingExams = async (req, res) => {
    try {
        const now = new Date();
        const exams = await Exam.find({ date: { $gte: now } })
            .populate("course")
            .populate("subject")
            .sort({ date: 1 });
        res.status(200).json(exams);
    } catch (error) {
        res.status(500).json({ message: "Error fetching upcoming exams", error: error.message });
    }
};

export const getExamStats = async (req, res) => {
    try {
        const [totalExams, upcomingExams] = await Promise.all([
            Exam.countDocuments(),
            Exam.countDocuments({ date: { $gte: new Date() } })
        ]);
        res.status(200).json({ totalExams, upcomingExams });
    } catch (error) {
        res.status(500).json({ message: "Error fetching exam stats", error: error.message });
    }
};

export const getDateSheet = async (req, res) => {
    try {
        const { courseId, semester } = req.query;
        const query = {};
        if (courseId) query.course = courseId;
        if (semester) query.semester = semester;
        
        const exams = await Exam.find(query)
            .populate("course", "name")
            .populate("subject", "name code")
            .sort({ date: 1 });
            
        res.status(200).json(exams);
    } catch (error) {
        res.status(500).json({ message: "Error fetching date sheet", error: error.message });
    }
};

