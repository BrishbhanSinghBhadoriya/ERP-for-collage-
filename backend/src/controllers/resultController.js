import Result from "../models/ResultSchema.js";

// Helper function for grade calculation
const calculateGrade = (marks, maxMarks) => {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    return "F";
};

export const uploadResult = async (req, res) => {
    const { student, exam, subject, marksObtained, maxMarks, remarks } = req.body;
    try {
        const grade = calculateGrade(marksObtained, maxMarks);
        const result = new Result({
            student,
            exam,
            subject,
            marksObtained,
            grade,
            remarks
        });
        await result.save();
        res.status(201).json({ message: "Result uploaded successfully", result });
    } catch (error) {
        res.status(500).json({ message: "Error uploading result", error: error.message });
    }
};

export const getStudentResults = async (req, res) => {
    try {
        const results = await Result.find({ student: req.params.studentId })
            .populate("exam")
            .populate("subject");
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: "Error fetching results", error: error.message });
    }
};

export const getExamResults = async (req, res) => {
    try {
        const results = await Result.find({ exam: req.params.examId })
            .populate({
                path: "student",
                populate: { path: "user", select: "name rollNumber" }
            });
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: "Error fetching exam results", error: error.message });
    }
};
