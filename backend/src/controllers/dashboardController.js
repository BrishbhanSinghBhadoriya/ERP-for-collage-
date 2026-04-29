import User from "../models/userSchema.js";
import Student from "../models/StudentSchema.js";
import Attendance from "../models/Attendance.js";
import EmployeeLeave from "../models/EmployeeLeaveSchema.js";
import Announcement from "../models/AnnouncementSchema.js";
import Exam from "../models/ExamSchema.js";
import Activity from "../models/ActivitySchema.js";
import Course from "../models/CourseSchema.js";

export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalFaculty,
      totalStudents,
      totalCourses,
      todayAttendanceCount,
      totalStudentsForAttendance
    ] = await Promise.all([
      User.countDocuments({ role: "faculty" }),
      Student.countDocuments(),
      Course.countDocuments(),
      Attendance.countDocuments({ 
        date: { $gte: today, $lt: tomorrow }, 
        status: "present" 
      }),
      User.countDocuments({ role: "student" })
    ]);

    const todayAttendance = totalStudentsForAttendance > 0 
      ? Math.round((todayAttendanceCount / totalStudentsForAttendance) * 100) 
      : 0;

    // Return data directly as expected by frontend useFetch
    res.status(200).json({
      totalStudents,
      totalFaculty,
      totalCourses,
      todayAttendance,
      studentTrend: "+12%",
      facultyTrend: "+2",
      attendanceTrend: "+5%"
    });
  } catch (error) {
    console.error("getDashboardStats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
      error: error.message
    });
  }
};

export const getDashboardTrends = async (req, res) => {
  try {
    // Return data in the object format expected by frontend
    const admissionTrends = [
      { year: "2021", students: 150 },
      { year: "2022", students: 200 },
      { year: "2023", students: 180 },
      { year: "2024", students: 240 },
      { year: "2025", students: 300 },
      { year: "2026", students: 350 },
    ];

    const feeCollection = [
      { month: "Jan", amount: 45000 },
      { month: "Feb", amount: 52000 },
      { month: "Mar", amount: 48000 },
      { month: "Apr", amount: 61000 },
      { month: "May", amount: 55000 },
      { month: "Jun", amount: 67000 },
    ];

    res.status(200).json({
      admissionTrends,
      feeCollection
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard trends",
      error: error.message
    });
  }
};

export const getRecentAdmissions = async (req, res) => {
  try {
    const recentAdmissions = await Student.find()
      .populate("user", "name email profilePicture")
      .populate("course", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    // Return array directly as expected by frontend
    res.status(200).json(recentAdmissions);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent admissions",
      error: error.message
    });
  }
};

export const getRecentActivities = async (req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ date: -1 })
      .limit(5);
    
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent activities",
      error: error.message
    });
  }
};

export const getStudentDashboard = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // In a real app, these would be calculated from the database
    // For now, returning mock data that matches the frontend expected format
    res.status(200).json({
      attendance: 85,
      attendanceTrend: "+2%",
      pendingFees: 12000,
      issuedBooks: 3,
      overdueBooks: 0,
      credits: 45
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch student dashboard",
      error: error.message
    });
  }
};
