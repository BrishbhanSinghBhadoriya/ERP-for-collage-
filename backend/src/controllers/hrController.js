import User from "../models/userSchema.js";
import Attendance from "../models/Attendance.js";
import EmployeeLeave from "../models/EmployeeLeaveSchema.js";
import Announcement from "../models/AnnouncementSchema.js";
import ForgetPasswordRequest from "../models/ForgetPasswordRequest.js"
import bcrypt from "bcrypt";
import * as XLSX from "xlsx";
import { generateEmployeeId } from "../utils/generateEmployeeId.js";

// --- Department & Designation ---

export const getDepartments = async (req, res) => {
  try {
    const departments = await User.distinct("department");
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch departments", error: error.message });
  }
};

export const getDesignations = async (req, res) => {
  try {
    const { department } = req.query;
    const query = department ? { department } : {};
    const designations = await User.distinct("designation", query);
    res.status(200).json(designations);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch designations", error: error.message });
  }
};

// --- Employee Management ---

export const getEmployee = async (req, res) => {
  try {
    const { page = 1, limit = 10, department, designation, status, search } = req.query;
    const query = { role: { $ne: "student" } };

    if (department) query.department = department;
    if (designation) query.designation = designation;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const employees = await User.find(query)
        .select("-password")
        .sort({ createdAt: -1 });

    res.status(200).json(employees);
  } catch (error) {
    console.error("getEmployee error:", error);
    res.status(500).json({ message: "Failed to fetch employees", error: error.message });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const id = req.params.id;
    const employee = await User.findById(id).select("-password");
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch employee", error: error.message });
  }
};

export const registerEmployee = async (req, res) => {
  try {
    const {
      username,
      password,
      name,
      email,
      phone,
      department,
      designation,
      role,
      joiningDate,
      gender,
      employeeId
    } = req.body;

    const existingUser = await User.findOne({ $or: [{ username }, { email }].concat(employeeId ? [{ employeeId }] : []) });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username, Email or Employee ID already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password || "Employee@123", 10);

    // Auto-generate employeeId if not provided
    const finalEmployeeId = employeeId || await generateEmployeeId(role || "employee");

    const newUser = new User({
      username,
      password: hashedPassword,
      name,
      email,
      phone,
      department,
      designation,
      role: role || "employee",
      joiningDate: joiningDate || new Date(),
      gender,
      employeeId: finalEmployeeId,
      isEmployee: true
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      data: newUser,
      message: "Employee registered successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to register employee",
      error: error.message
    });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: "Employee updated successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update employee",
      error: error.message
    });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    // Soft delete by setting isActive to false
    user.isActive = false;
    user.status = "terminated";
    await user.save();

    res.status(200).json({
      success: true,
      message: "Employee removed successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove employee",
      error: error.message
    });
  }
};

export const updateEmployeeSalary = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { basic, hra, specialAllowance, pfContribution } = req.body;

    const totalMonthly = (Number(basic) || 0) + (Number(hra) || 0) + (Number(specialAllowance) || 0);
    const totalAnnual = totalMonthly * 12;

    const updatedUser = await User.findByIdAndUpdate(
      employeeId,
      {
        $set: {
          "salary.basic": basic,
          "salary.hra": hra,
          "salary.specialAllowance": specialAllowance,
          "salary.pfContribution": pfContribution,
          "salary.totalMonthly": totalMonthly,
          "salary.totalAnnual": totalAnnual
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Salary structure updated successfully",
      salary: updatedUser.salary
    });
  } catch (error) {
    console.error("updateEmployeeSalary error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update salary structure",
      error: error.message
    });
  }
};

export const importEmployees = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "File is empty"
      });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    const hashedPassword = await bcrypt.hash("Employee@123", 10);

    for (const row of data) {
      try {
        const {
          username,
          name,
          email,
          phone,
          department,
          designation,
          role,
          employeeId,
          gender
        } = row;

        if (!username || !email || !employeeId) {
          results.failed++;
          results.errors.push(`Row ${results.success + results.failed}: Missing required fields`);
          continue;
        }

        const existingUser = await User.findOne({ $or: [{ username }, { email }, { employeeId }] });
        if (existingUser) {
          results.failed++;
          results.errors.push(`Row ${results.success + results.failed}: ${username}/${email}/${employeeId} already exists`);
          continue;
        }

        const newUser = new User({
          username,
          password: hashedPassword,
          name,
          email,
          phone,
          department,
          designation,
          role: role || "employee",
          joiningDate: new Date(),
          gender,
          employeeId,
          isEmployee: true
        });

        await newUser.save();
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${results.success + results.failed}: ${error.message}`);
      }
    }

    res.status(200).json({
      success: true,
      message: "Import process completed",
      data: results
    });
  } catch (error) {
    console.error("importEmployees error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to import employees",
      error: error.message
    });
  }
};

// --- HR Dashboard & Attendance ---

export const getHrDashboardWithAttendance = async (req, res) => {
  try {
    const requester = req.user;

    if (!requester || requester.role !== "hr" && requester.role !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Only HR has permission to access this route"
      });
    }

    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const [employeeCount, departmentwiseEmployeeCount, newJoinersCount, pendingLeavesCount] =
      await Promise.all([
        User.countDocuments({ role: { $ne: "student" } }),
        User.countDocuments({ department: requester.department }),
        User.countDocuments({ joiningDate: { $gte: oneMonthAgo, $lte: now } }),
        EmployeeLeave.countDocuments({ status: "pending" }),
      ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let rangeStart = today;
    let rangeEnd = tomorrow;
    let attendance = await Attendance.find({
      date: { $gte: rangeStart, $lt: rangeEnd }
    }).lean();

    if (!attendance || attendance.length === 0) {
      const nextDay = new Date(tomorrow);
      const dayAfterNext = new Date(nextDay);
      dayAfterNext.setDate(dayAfterNext.getDate() + 1);
      rangeStart = nextDay;
      rangeEnd = dayAfterNext;
      attendance = await Attendance.find({
        date: { $gte: rangeStart, $lt: rangeEnd }
      }).lean();
    }

    const presentCount = await Attendance.countDocuments({
      date: { $gte: rangeStart, $lt: rangeEnd },
      status: "present"
    });
    const departmentwisePresentCount = await Attendance.countDocuments({
      date: { $gte: rangeStart, $lt: rangeEnd },
      status: "present",
      department: requester.department
    });
    const departmentwiseAbsentCount = await Attendance.countDocuments({
      date: { $gte: rangeStart, $lt: rangeEnd },
      status: "absent",
      department: requester.department
    });
    const departmentwiseLateCount = await Attendance.countDocuments({
      date: { $gte: rangeStart, $lt: rangeEnd },
      status: "late",
      department: requester.department
    });
    const departmentwiseOnLeaveCount = await Attendance.countDocuments({
      date: { $gte: rangeStart, $lt: rangeEnd },
      status: "leave",
      department: requester.department
    });

    const absentCount = await Attendance.countDocuments({
      date: { $gte: rangeStart, $lt: rangeEnd },
      status: "absent"
    });

    const lateCount = await Attendance.countDocuments({
      date: { $gte: rangeStart, $lt: rangeEnd },
      status: "late"
    });

    const TEN_DAYS = 10;
    const usersWithDob = await User.find({ dob: { $ne: null } })
      .select("_id name employeeId department designation dob email profilePicture")
      .lean();

    const startOfTodayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

    const upcomingBirthdays = usersWithDob
      .map(u => {
        const raw = u.dob instanceof Date ? u.dob : new Date(u.dob);
        if (isNaN(raw.getTime())) return null;
        const month = raw.getUTCMonth();
        const day = raw.getUTCDate();
        let nextOccurUtc = new Date(Date.UTC(startOfTodayUtc.getUTCFullYear(), month, day));
        if (nextOccurUtc < startOfTodayUtc) {
          nextOccurUtc = new Date(Date.UTC(startOfTodayUtc.getUTCFullYear() + 1, month, day));
        }
        const diffDays = Math.floor((nextOccurUtc - startOfTodayUtc) / 86400000);
        if (diffDays < 0 || diffDays > TEN_DAYS) return null;
        return { ...u, nextBirthday: nextOccurUtc, diffDays };
      })
      .filter(Boolean)
      .sort((a, b) => a.nextBirthday - b.nextBirthday)
      .map(({ nextBirthday, diffDays, ...rest }) => rest);

    res.status(200).json({
      success: true,
      stats: {
        totalEmployees: employeeCount,
        departmentwiseEmployees: departmentwiseEmployeeCount,
        newJoiners: newJoinersCount,
        pendingLeaves: pendingLeavesCount
      },
      attendanceReport: {
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        records: attendance,
        departmentwisePresent: departmentwisePresentCount,
        departmentwiseAbsent: departmentwiseAbsentCount,
        departmentwiseLate: departmentwiseLateCount,
        departmentwiseOnLeave: departmentwiseOnLeaveCount
      },
      birthdays: upcomingBirthdays,
      message: "HR dashboard stats, attendance & birthdays fetched successfully"
    });
  } catch (error) {
    console.error("getHrDashboardWithAttendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch HR dashboard stats & attendance",
      error: error.message
    });
  }
};

export const getUpcomingLeave = async (req, res) => {
  try {
    const upcomingLeaves = await EmployeeLeave.find({
      employeeRole: { $ne: "hr" }
    }).populate("employeeId", "name email profilePicture").sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      upcomingLeaves,
      message: "Upcoming leaves fetched successfully"
    });
  } catch (error) {
    console.error("getUpcomingLeave error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch upcoming leaves",
      error: error.message
    });
  }
};

// --- Announcements ---

export const createAnnouncement = async (req, res) => {
  try {
    const userId = req.user._id;
    const { subject, audience, publishedDate, expiryDate, body, image, document } = req.body;

    if (!subject || !audience || !publishedDate || !expiryDate || !body) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const newAnnouncement = new Announcement({
      user: userId,
      subject,
      audience,
      publishedDate: new Date(publishedDate),
      expiryDate: new Date(expiryDate),
      body,
      image: image || null,
      document: document || null,
    });

    await newAnnouncement.save();

    return res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      data: newAnnouncement
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

export const getAnnouncement = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      announcements,
      message: "Announcements fetched successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch announcements",
      error: error.message
    });
  }
};

// --- Password Requests ---

export const getforgetPasswordRequest = async (req, res) => {
  try {
    const forgetPasswordRequest = await ForgetPasswordRequest.find();
    res.status(200).json({
      success: true,
      forgetPasswordRequest,
      message: "Forget password request fetched successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch password requests",
      error: error.message
    });
  }
};

export const editPassword = async (req, res) => {
  try {
    const { email, newpassword } = req.body;

    if (!email || !newpassword) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required",
      });
    }

    const hashedPassword = await bcrypt.hash(newpassword, 10);

    const user = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User with this email not found",
      });
    }

    await ForgetPasswordRequest.findOneAndUpdate(
      { email },
      { status: "approved" },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const deleteforgetPasswordRequest = async (req, res) => {
  try {
    const { id } = req.params;
    await ForgetPasswordRequest.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Forget password request deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete password request",
      error: error.message
    });
  }
};
