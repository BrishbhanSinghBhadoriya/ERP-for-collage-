import mongoose from "mongoose";
import Exam from "../models/ExamSchema.js";
import Course from "../models/CourseSchema.js";
import Subject from "../models/SubjectSchema.js";

export const createExam = async (req, res) => {
    try {
        const { date, course, subject, name, semester, maxMarks } = req.body;

        // Basic validation
        if (!date || !course || !subject || !name || !semester || !maxMarks) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        let courseId = course;
        let subjectId = subject;

        // If course is a name, find ID
        if (course && !mongoose.Types.ObjectId.isValid(course)) {
            const foundCourse = await Course.findOne({ 
                $or: [
                    { name: { $regex: new RegExp(`^${course}$`, 'i') } },
                    { code: { $regex: new RegExp(`^${course}$`, 'i') } }
                ]
            });
            if (foundCourse) {
                courseId = foundCourse._id;
            } else {
                return res.status(400).json({ message: `Course '${course}' not found. Please provide a valid course name or ID.` });
            }
        } else if (!mongoose.Types.ObjectId.isValid(course)) {
            return res.status(400).json({ message: "Invalid Course ID" });
        }

        // If subject is a name, find ID
        if (subject && !mongoose.Types.ObjectId.isValid(subject)) {
            const foundSubject = await Subject.findOne({ 
                $or: [
                    { name: { $regex: new RegExp(`^${subject}$`, 'i') } },
                    { code: { $regex: new RegExp(`^${subject}$`, 'i') } }
                ]
            });
            if (foundSubject) {
                subjectId = foundSubject._id;
            } else {
                return res.status(400).json({ message: `Subject '${subject}' not found. Please provide a valid subject name or ID.` });
            }
        } else if (!mongoose.Types.ObjectId.isValid(subject)) {
            return res.status(400).json({ message: "Invalid Subject ID" });
        }

        const exam = new Exam({
            name,
            course: courseId,
            subject: subjectId,
            date: new Date(date),
            semester,
            maxMarks
        });

        await exam.save();
        res.status(201).json(exam);
    } catch (error) {
        console.error("createExam error:", error);
        res.status(500).json({ message: "Error scheduling exam", error: error.message });
    }
};

export const getAllExams = async (req, res) => {
    try {
        const exams = await Exam.find()
            .populate("course", "name code")
            .populate("subject", "name code")
            .sort({ date: 1 });
        res.status(200).json(exams);
    } catch (error) {
        console.error("getAllExams error:", error);
        res.status(500).json({ message: "Error fetching exams", error: error.message });
    }
};

export const getExamsByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const query = {};
        
        if (courseId && mongoose.Types.ObjectId.isValid(courseId)) {
            query.course = courseId;
        } else if (courseId) {
            // Handle course name
            const foundCourse = await Course.findOne({ 
                $or: [
                    { name: { $regex: new RegExp(`^${courseId}$`, 'i') } },
                    { code: { $regex: new RegExp(`^${courseId}$`, 'i') } }
                ]
            });
            if (foundCourse) {
                query.course = foundCourse._id;
            } else {
                return res.status(200).json([]); // Return empty if course not found
            }
        }

        const exams = await Exam.find(query)
            .populate("course", "name code")
            .populate("subject", "name code")
            .sort({ date: 1 });
        res.status(200).json(exams);
    } catch (error) {
        console.error("getExamsByCourse error:", error);
        res.status(500).json({ message: "Error fetching exams", error: error.message });
    }
};

export const updateExam = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid exam ID" });
        }
        const exam = await Exam.findByIdAndUpdate(id, req.body, { new: true });
        if (!exam) return res.status(404).json({ message: "Exam not found" });
        res.status(200).json(exam);
    } catch (error) {
        console.error("updateExam error:", error);
        res.status(500).json({ message: "Error updating exam", error: error.message });
    }
};

export const deleteExam = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid exam ID" });
        }
        const exam = await Exam.findByIdAndDelete(id);
        if (!exam) return res.status(404).json({ message: "Exam not found" });
        res.status(200).json({ message: "Exam deleted successfully" });
    } catch (error) {
        console.error("deleteExam error:", error);
        res.status(500).json({ message: "Error deleting exam", error: error.message });
    }
};

export const getUpcomingExams = async (req, res) => {
    try {
        const now = new Date();
        const exams = await Exam.find({ date: { $gte: now } })
            .populate("course", "name code")
            .populate("subject", "name code")
            .sort({ date: 1 });
        res.status(200).json(exams);
    } catch (error) {
        console.error("getUpcomingExams error:", error);
        res.status(500).json({ message: "Error fetching upcoming exams", error: error.message });
    }
};

export const getExamStats = async (req, res) => {
    try {
        const now = new Date();
        const [totalExams, upcomingExamsCount, nextExam] = await Promise.all([
            Exam.countDocuments(),
            Exam.countDocuments({ date: { $gte: now } }),
            Exam.findOne({ date: { $gte: now } }).sort({ date: 1 })
        ]);

        res.status(200).json({ 
            totalExams, 
            activeExamsCount: upcomingExamsCount,
            nextExamDate: nextExam ? nextExam.date : null,
            currentStatus: upcomingExamsCount > 0 ? "EXAMS IN PROGRESS" : "NO ACTIVE EXAMS"
        });
    } catch (error) {
        console.error("getExamStats error:", error);
        res.status(500).json({ message: "Error fetching exam stats", error: error.message });
    }
};

export const getDateSheet = async (req, res) => {
    try {
        const { courseId, semester } = req.query;
        const query = {};
        if (courseId && mongoose.Types.ObjectId.isValid(courseId)) {
            query.course = courseId;
        }
        if (semester) query.semester = semester;
        
        const exams = await Exam.find(query)
            .populate("course", "name code")
            .populate("subject", "name code")
            .sort({ date: 1 });
            
        res.status(200).json(exams);
    } catch (error) {
        console.error("getDateSheet error:", error);
        res.status(500).json({ message: "Error fetching date sheet", error: error.message });
    }
};

