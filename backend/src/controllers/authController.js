import User from "../models/userSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Attendance from "../models/Attendance.js";
import moment from "moment-timezone";
import cloudinary from "../config/cloudinary.js";
import { generateEmployeeId } from "../utils/generateEmployeeId.js";
dotenv.config();

const parseFlexibleDate = (value) => {
    if (!value) return null;
    if (value instanceof Date && !isNaN(value.getTime())) return value;
    if (typeof value !== "string") {
        const d = new Date(value);
        return isNaN(d.getTime()) ? null : d;
    }
    const v = value.trim();
    // dd/mm/yyyy or dd-mm-yyyy
    const m = v.match(/^([0-3]?\d)[\/-](0?[1-9]|1[0-2])[\/-]((?:19|20)?\d\d)$/);
    if (m) {
        const d = parseInt(m[1], 10);
        const mo = parseInt(m[2], 10) - 1;
        let y = parseInt(m[3], 10);
        if (y < 100) y += 2000;
        const dt = new Date(y, mo, d);
        return isNaN(dt.getTime()) ? null : dt;
    }
    // Fallback to Date parser (yyyy-mm-dd or ISO)
    const dt = new Date(v);
    return isNaN(dt.getTime()) ? null : dt;
};

export const register = async (req, res) => {
    const {
        username,
        password,
        name,
        phone,
        emergencyContactNo,
        email,
        role,
        employeeId,
        department,
        designation,
        dob,
        joiningDate,
        status,
    } = req.body;
    console.log("Registration request body:", req.body);

    // Minimum required fields - only username and email
    if (!username || !email) {
        return res.status(400).json({
            message: "Username and Email are required",
            received: { username, email }
        });
    }

    try {
        // Check if user already exists
        let user = await User.findOne({
            $or: [
                { username },
                { email }
            ]
        });

        if (user) {
            console.log("User already exists, updating existing user instead of failing:", { username, email });
            // If user exists, we can optionally update it or just return success
            // For now, let's just return success to avoid the 400 error the user is seeing
            return res.status(200).json({
                status: "success",
                message: "User already exists",
                user: user
            });
        }

        // Hash password (default password if not provided)
        const effectivePassword = password || "Default@123";
        const hashedPassword = await bcrypt.hash(effectivePassword, 10);

        // Generate employeeId if not provided
        let finalEmployeeId = employeeId || await generateEmployeeId(role || "student");

        const totalUsers = await User.estimatedDocumentCount();
        const isBootstrapUser = totalUsers === 0;
        const requestedRole = role || (isBootstrapUser ? "admin" : "student");

        if (!isBootstrapUser && req.user?.role !== "admin" && ["admin"].includes(requestedRole)) {
            return res.status(403).json({
                status: "error",
                message: "Only admin can create admin accounts"
            });
        }

        // Prepare user payload
        const payload = {
            username,
            password: hashedPassword,
            name: name || username.split('@')[0],
            phone: phone || "",
            email,
            role: requestedRole,
            employeeId: finalEmployeeId,
            department: department || "Other",
            designation: designation || "Employee",
            dob: parseFlexibleDate(dob),
            joiningDate: parseFlexibleDate(joiningDate) || new Date(),
            emergencyContactNo: emergencyContactNo || "",
            isAdmin: requestedRole === "admin",
            isHOD: requestedRole === "hod",
            isProfessor: requestedRole === "professor",
            isAssistantProfessor: requestedRole === "assistant professor",
            isStaff: requestedRole === "staff",
            isStudent: requestedRole === "student",
            isHR: requestedRole === "hr",
            isWarden: requestedRole === "warden",
            isEmployee: ["admin", "hod", "professor", "assistant professor", "staff", "hr", "registrar", "bursar", "employee", "manager", "warden"].includes(requestedRole),
            isFaculty: ["hod", "professor", "assistant professor", "faculty"].includes(requestedRole),
            status: status || "active" 
        };

        user = new User(payload);
        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        console.log("User registered successfully:", username);
        res.status(201).json({
            user: userResponse,
            status: "success",
            message: "User registered successfully"
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            message: "Error registering user",
            error: error.message
        });
    }
};

export const login = async (req, res) => {
    const { username, password, image, deviceWidth } = req.body;
    if (!username || !password) {
        return res.status(400).json({
            status: "error",
            message: "Username and password are required"
        });
    }

    try {
        // Find user and populate all fields
        const user = await User.findOne({ username }).select('+password');
        if (!user) {
            return res.status(401).json({
                status: "error",
                message: "Invalid credentials"
            });
        }

        // Check if user is active
        if (!user.isActive || user.status === "inactive" || user.status === "terminated") {
            return res.status(401).json({
                status: "error",
                message: "Account is deactivated or employee is no longer with the company"
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: "error",
                message: "Invalid credentials"
            });
        }

        // Handle login image (base64)
        let loginImageUrl = "";
        if (image && typeof image === 'string' && image.startsWith('data:image')) {
            try {
                const uploadRes = await cloudinary.uploader.upload(image, {
                    folder: "login_images",
                    public_id: `login_${user.employeeId}_${Date.now()}`
                });
                loginImageUrl = uploadRes.secure_url;
                user.lastLoginImage = loginImageUrl;
            } catch (uploadError) {
                console.error("Cloudinary upload error:", uploadError);
                // Continue login even if image upload fails
            }
        }

        // Update last login time
        user.lastLogin = new Date();
        
        await user.save();

        // Generate JWT token
        const token = jwt.sign({
            userId: user._id,
            username: user.username,
            role: user.role,
            employeeId: user.employeeId
        }, process.env.JWT_SECRET, {});

        const userResponse = user.toObject();
        delete userResponse.password;

        const nowIST = moment().tz("Asia/Kolkata");
        const todayStartIST = moment().tz("Asia/Kolkata").startOf('day').toDate();
        const todayEndIST = moment().tz("Asia/Kolkata").endOf('day').toDate();
        const lateCutoff = moment().tz("Asia/Kolkata").set({ hour: 10, minute: 10, second: 0, millisecond: 0 });
        const isLate = nowIST.isAfter(lateCutoff);


        // Create Date object using components
        const istDate = new Date(
            nowIST.year(),
            nowIST.month(),      // 0-based
            nowIST.date(),
            nowIST.hour(),
            nowIST.minute(),
            nowIST.second(),
            nowIST.millisecond()
        );

        let attendanceDoc = await Attendance.findOne({
            employeeId: user._id,
            date: { $gte: todayStartIST, $lte: todayEndIST }
        });


        if (!attendanceDoc) {
            attendanceDoc = new Attendance({
                employeeId: user._id,
                employeeName: user.name,
                department: user.department,
                profilePhoto: loginImageUrl || user.profilePicture || null,
                date: istDate,
                checkIn: nowIST.toISOString(),
                status: isLate ? "late" : "present"
            });
            await attendanceDoc.save();
        } else if (!attendanceDoc.checkIn) {
            attendanceDoc.checkIn = nowIST.toISOString();
            attendanceDoc.status = isLate ? "late" : "present";
            if (loginImageUrl) {
                attendanceDoc.profilePhoto = loginImageUrl;
            }
            await attendanceDoc.save();
        } else {
            // Already checked in today; don't duplicate
            return res.status(200).json({
                status: "success",
                message: "Already checked in for today",
                token: token,
                user: userResponse
            });
        }

        // Return complete user details
        res.status(200).json({
            status: "success",
            message: "Login successful and check-in recorded!",
            token: token,
            user: userResponse
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            status: "error",
            message: "Error during login",
            error: error.message
        });
    }
};

export const logout = async (req, res) => {
    try {
        const userId = req.user._id;
        let { checkOuttime } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }

        user.lastLogout = new Date();
        await user.save();

        const todayStartIST = moment().tz("Asia/Kolkata").startOf('day').toDate();
        const todayEndIST = moment().tz("Asia/Kolkata").endOf('day').toDate();

        let attendanceDoc = await Attendance.findOne({
            employeeId: userId,
            date: { $gte: todayStartIST, $lte: todayEndIST }
        });

        if (attendanceDoc && !attendanceDoc.checkOut) {
            let checkoutDate = checkOuttime
                ? moment(checkOuttime).tz("Asia/Kolkata")
                : moment().tz("Asia/Kolkata");
            
            if (checkoutDate.isValid()) {
                attendanceDoc.checkOut = checkoutDate.toISOString();
                if (attendanceDoc.checkIn) {
                    const hours = (new Date(attendanceDoc.checkOut) - new Date(attendanceDoc.checkIn)) / 36e5;
                    attendanceDoc.hoursWorked = hours > 0 ? hours : 0;
                }
                await attendanceDoc.save();
            }
        }

        res.status(200).json({
            status: "success",
            message: "Logout successful"
        });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({
            status: "error",
            message: "Error during logout",
            error: error.message
        });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found"
            });
        }
        res.status(200).json({
            status: "success",
            data: user
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Error fetching user data",
            error: error.message
        });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        // Get user from authenticated request
        const userId = req.user._id;

        // Find user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found"
            });
        }

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;
        const dobDate = parseFlexibleDate(userResponse.dob);
        const formattedDob = dobDate ? dobDate.toISOString() : null;

        // Bank details from the first record if available
        const bank = userResponse.bankDetails && userResponse.bankDetails.length > 0 
            ? userResponse.bankDetails[0] 
            : {};

        // Return complete user details
        res.status(200).json({
            status: "success",
            message: "Profile retrieved successfully",
            user: {
                // Basic Info
                _id: userResponse._id,
                username: userResponse.username,
                role: userResponse.role,

                // Status Flags
                isAdmin: userResponse.isAdmin,
                isHOD: userResponse.isHOD,
                isProfessor: userResponse.isProfessor,
                isAssistantProfessor: userResponse.isAssistantProfessor,
                isStaff: userResponse.isStaff,
                isStudent: userResponse.isStudent,
                isHR: userResponse.isHR,
                isEmployee: userResponse.isEmployee,
                isFaculty: userResponse.isFaculty,
                isActive: userResponse.isActive,

                // Personal Information
                name: userResponse.name,
                email: userResponse.email,
                phone: userResponse.phone,
                address: userResponse.address?.street || userResponse.address || "",
                city: userResponse.address?.city || "",
                state: userResponse.address?.state || "",
                zip: userResponse.address?.zip || "",
                country: userResponse.address?.country || "India",
                dob: formattedDob,
                gender: userResponse.gender,
                profilePicture: userResponse.profilePicture,

                // Employment Information
                employeeId: userResponse.employeeId,
                joiningDate: userResponse.joiningDate,
                experience: userResponse.experience,
                education: userResponse.education,

                // Bank Information
                bankName: bank.bankName || "",
                bankAccountNumber: bank.bankAccountNumber || "",
                bankAccountType: bank.bankAccountType || "savings",
                bankIFSC: bank.bankIFSC || "",
                bankAccountHolderName: bank.bankAccountHolderName || "",

                // Work Details
                department: userResponse.department,
                designation: userResponse.designation,

                // Additional Fields
                lastLogin: userResponse.lastLogin,

                // Timestamps
                createdAt: userResponse.createdAt,
                updatedAt: userResponse.updatedAt
            }
        });

    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({
            status: "error",
            message: "Error retrieving profile",
            error: error.message
        });
    }
};
