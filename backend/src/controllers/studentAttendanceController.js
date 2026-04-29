import StudentAttendance from "../models/StudentAttendance.js";
import Student from "../models/StudentSchema.js";

// Mark attendance for a single student
export const markAttendance = async (req, res) => {
    try {
        const attendance = new StudentAttendance(req.body);
        await attendance.save();
        res.status(201).json({ message: "Attendance marked successfully", attendance });
    } catch (error) {
        res.status(500).json({ message: "Error marking attendance", error: error.message });
    }
};

// Bulk mark attendance for a class/section
export const bulkMarkAttendance = async (req, res) => {
    const { subject, date, semester, attendanceData } = req.body;
    // attendanceData: [{ student: id, status: 'Present'|'Absent'|'Late' }]

    try {
        const attendanceRecords = attendanceData.map(record => ({
            student: record.student,
            subject,
            date: new Date(date),
            status: record.status,
            semester
        }));

        await StudentAttendance.insertMany(attendanceRecords);
        res.status(201).json({ message: "Bulk attendance marked successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error bulk marking attendance", error: error.message });
    }
};

// Get attendance by student
export const getStudentAttendance = async (req, res) => {
    try {
        const attendance = await StudentAttendance.find({ student: req.params.studentId })
            .populate({
                path: "student",
                populate: { path: "user", select: "name email profilePicture" },
            })
            .populate({
                path: "subject",
                populate: { path: "faculty", select: "name email profilePicture" },
            });
        res.status(200).json(attendance);
    } catch (error) {
        res.status(500).json({ message: "Error fetching attendance", error: error.message });
    }
};

// Get attendance for a class/subject/date
export const getClassAttendance = async (req, res) => {
    const { subjectId, date } = req.query;
    try {
        const query = { subject: subjectId };
        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            query.date = { $gte: startDate, $lte: endDate };
        }
        const attendance = await StudentAttendance.find(query)
            .populate({
                path: "student",
                populate: { path: "user", select: "name email profilePicture" },
            })
            .populate({
                path: "subject",
                populate: { path: "faculty", select: "name email profilePicture" },
            });
        res.status(200).json(attendance);
    } catch (error) {
        res.status(500).json({ message: "Error fetching class attendance", error: error.message });
    }
};

// Get attendance report for a student (percentage)
export const getStudentAttendanceReport = async (req, res) => {
    const { studentId } = req.params;
    try {
        const totalLectures = await StudentAttendance.countDocuments({ student: studentId });
        const presentLectures = await StudentAttendance.countDocuments({ student: studentId, status: "Present" });

        const percentage = totalLectures > 0 ? (presentLectures / totalLectures) * 100 : 0;

        res.status(200).json({
            totalLectures,
            presentLectures,
            percentage: percentage.toFixed(2) + "%"
        });
    } catch (error) {
        res.status(500).json({ message: "Error generating attendance report", error: error.message });
    }
};
