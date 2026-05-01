import HostelLeave from "../models/HostelLeaveSchema.js";
import User from "../models/userSchema.js";

// Create a hostel leave request
export const createHostelLeave = async (req, res) => {
    try {
        const { reason, startDate, endDate } = req.body;
        const studentId = req.user._id;

        if (!reason || !startDate || !endDate) {
            return res.status(400).json({ status: "error", message: "Missing required fields" });
        }

        const newLeave = await HostelLeave.create({
            studentId,
            reason,
            startDate,
            endDate
        });

        res.status(201).json({ status: "success", data: newLeave });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// Get leaves based on user role
export const getHostelLeaves = async (req, res) => {
    try {
        const { role, _id } = req.user;
        let query = {};

        if (role === "student") {
            query = { studentId: _id };
        } else if (role === "warden") {
            // Warden sees all leaves (pending their approval or those they need to forward)
            query = {};
        } else if (role === "hod") {
            // HOD only sees leaves forwarded to them
            query = { forwardedToHOD: true };
        } else if (role === "hr" || role === "admin") {
            query = {};
        }

        const leaves = await HostelLeave.find(query)
            .populate("studentId", "name email department")
            .sort({ createdAt: -1 });

        res.status(200).json({ status: "success", data: leaves });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// Warden Approval
export const approveByWarden = async (req, res) => {
    try {
        const { leaveId, status, remarks } = req.body;
        
        const leave = await HostelLeave.findById(leaveId);
        if (!leave) return res.status(404).json({ status: "error", message: "Leave not found" });

        leave.wardenStatus = status;
        leave.wardenRemarks = remarks || "";
        leave.wardenActionDate = new Date();

        if (status === "Approved") {
            leave.forwardedToHOD = true;
        } else {
            leave.finalStatus = "Rejected";
            leave.forwardedToStudent = true;
        }

        await leave.save();
        res.status(200).json({ status: "success", data: leave });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// HOD Approval
export const approveByHOD = async (req, res) => {
    try {
        const { leaveId, status, remarks } = req.body;

        const leave = await HostelLeave.findById(leaveId);
        if (!leave) return res.status(404).json({ status: "error", message: "Leave not found" });

        if (!leave.forwardedToHOD) {
            return res.status(400).json({ status: "error", message: "Leave not yet forwarded to HOD" });
        }

        leave.hodStatus = status;
        leave.hodRemarks = remarks || "";
        leave.hodActionDate = new Date();

        if (status === "Rejected") {
            leave.finalStatus = "Rejected";
            leave.forwardedToStudent = true;
        }

        await leave.save();
        res.status(200).json({ status: "success", data: leave });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// Warden Final Forward
export const finalForwardByWarden = async (req, res) => {
    try {
        const { leaveId } = req.body;

        const leave = await HostelLeave.findById(leaveId);
        if (!leave) return res.status(404).json({ status: "error", message: "Leave not found" });

        if (leave.hodStatus !== "Approved") {
            return res.status(400).json({ status: "error", message: "HOD approval required before final forward" });
        }

        leave.finalStatus = "Approved";
        leave.forwardedToStudent = true;
        leave.finalForwardDate = new Date();

        await leave.save();
        res.status(200).json({ status: "success", data: leave });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};
