import Student from "../models/StudentSchema.js";
import User from "../models/userSchema.js";
import Course from "../models/CourseSchema.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { generateEmployeeId } from "../utils/generateEmployeeId.js";

// Admission Controller: Create User (role: student) + Create Student record
export const admitStudent = async (req, res) => {
    const {
        username,
        password,
        name,
        email,
        rollNumber,
        rollNo,
        enrollmentNumber,
        course,
        semester,
        year,
        section,
        guardianName,
        guardianContact,
        academicHistory,
        phone,
        address
    } = req.body;

    try {
        // Validate required fields for User
        if (!username || !email) {
            return res.status(400).json({ message: "Username and email are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: "User with this username or email already exists" });
        }

        // Check if student record already exists
        const studentRoll = rollNumber || rollNo;
        if (!studentRoll || !enrollmentNumber) {
            return res.status(400).json({ message: "Roll number and enrollment number are required" });
        }

        const existingStudent = await Student.findOne({ 
            $or: [
                { rollNumber: studentRoll }, 
                { rollNo: studentRoll },
                { enrollmentNumber }
            ] 
        });
        if (existingStudent) {
            return res.status(400).json({ message: "Student with this roll number or enrollment number already exists" });
        }

        // Handle Course: If it's a name, find the ID. If it's an ID, verify it.
        let courseId = course;
        if (course && !mongoose.Types.ObjectId.isValid(course)) {
            const foundCourse = await Course.findOne({ name: { $regex: new RegExp(`^${course}$`, 'i') } });
            if (foundCourse) {
                courseId = foundCourse._id;
            } else {
                return res.status(400).json({ message: `Course '${course}' not found. Please provide a valid course name or ID.` });
            }
        } else if (!course) {
            return res.status(400).json({ message: "Course is required" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password || "Student@123", 10);

        // Auto-generate a unique student ID (STU-XXXX)
        const autoStudentId = await generateEmployeeId("student");

        // Create User
        const user = new User({
            username,
            password: hashedPassword,
            name,
            email,
            phone,
            address,
            role: "student",
            employeeId: autoStudentId,
            isStudent: true,
            isEmployee: false,
            isActive: true,
            status: "active"
        });

        const savedUser = await user.save();

        // Create Student record
        const student = new Student({
            user: savedUser._id,
            rollNumber: studentRoll,
            rollNo: studentRoll,
            enrollmentNumber,
            course: courseId,
            semester: semester || 1,
            year: year || 1,
            section: section || "A",
            guardianName: guardianName || "Not Provided",
            guardianContact: guardianContact || "Not Provided",
            academicHistory: Array.isArray(academicHistory) ? academicHistory : [],
            admissionDate: new Date()
        });

        const savedStudent = await student.save();

        // Update User with studentProfile reference
        savedUser.studentProfile = savedStudent._id;
        await savedUser.save();

        res.status(201).json({
            message: "Student admitted successfully",
            student: savedStudent,
            user: {
                id: savedUser._id,
                username: savedUser.username,
                role: savedUser.role
            }
        });
    } catch (error) {
        console.error("Admission error:", error);
        res.status(500).json({ message: "Error during student admission", error: error.message });
    }
};

// Get all students with pagination, search, and filter
export const getAllStudents = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, course, year } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { rollNumber: { $regex: search, $options: "i" } },
                { rollNo: { $regex: search, $options: "i" } }
            ];
            // Also search by user name if populated
            const users = await User.find({ name: { $regex: search, $options: "i" } }).select("_id");
            const userIds = users.map(u => u._id);
            if (userIds.length > 0) {
                query.$or.push({ user: { $in: userIds } });
            }
        }

        if (course) query.course = course;
        if (year) query.year = year;

        const students = await Student.find(query)
            .populate("user", "-password")
            .populate("course")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Student.countDocuments(query);

        res.status(200).json({
            students,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalStudents: count
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching students", error: error.message });
    }
};

// Get student by ID
export const getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate("user", "-password").populate("course");
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ message: "Error fetching student", error: error.message });
    }
};

// Update student
export const updateStudent = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Update student record
        const updatedStudent = await Student.findByIdAndUpdate(id, updateData, { new: true }).populate("user", "-password");

        // If user data is provided, update user record as well
        if (updateData.name || updateData.email || updateData.phone) {
            await User.findByIdAndUpdate(student.user, {
                name: updateData.name,
                email: updateData.email,
                phone: updateData.phone
            });
        }

        res.status(200).json({
            message: "Student updated successfully",
            student: updatedStudent
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating student", error: error.message });
    }
};

// Delete student (Soft Delete)
export const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Deactivate user account
        await User.findByIdAndUpdate(student.user, { isActive: false });
        
        // Update student status
        student.status = "Suspended";
        await student.save();

        res.status(200).json({ message: "Student deleted successfully (deactivated)" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting student", error: error.message });
    }
};
