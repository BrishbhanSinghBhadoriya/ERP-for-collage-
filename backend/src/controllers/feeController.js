import Fee from "../models/FeeSchema.js";
import Student from "../models/StudentSchema.js";

// Create a fee record (Billing)
export const createFeeRecord = async (req, res) => {
    try {
        const payload = req.body || {};
        const total = Number(payload.amount ?? 0);
        const paid = Number(payload.paidAmount ?? 0);
        const normalizedPaid = Number.isFinite(paid) ? Math.max(0, Math.min(paid, total)) : 0;

        const fee = new Fee({
            ...payload,
            paidAmount: normalizedPaid,
            status: normalizedPaid >= total ? "Paid" : normalizedPaid > 0 ? "Partial" : "Pending",
            paymentDate: normalizedPaid > 0 ? new Date() : payload.paymentDate,
        });
        await fee.save();
        res.status(201).json({ message: "Fee record created successfully", fee });
    } catch (error) {
        res.status(500).json({ message: "Error creating fee record", error: error.message });
    }
};

// Update fee record
export const updateFeeRecord = async (req, res) => {
    try {
        const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!fee) return res.status(404).json({ message: "Fee record not found" });
        res.status(200).json({ message: "Fee record updated successfully", fee });
    } catch (error) {
        res.status(500).json({ message: "Error updating fee record", error: error.message });
    }
};

// Delete fee record
export const deleteFeeRecord = async (req, res) => {
    try {
        const fee = await Fee.findByIdAndDelete(req.params.id);
        if (!fee) return res.status(404).json({ message: "Fee record not found" });
        res.status(200).json({ message: "Fee record deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting fee record", error: error.message });
    }
};

// Process Payment
export const processPayment = async (req, res) => {
    const { transactionId, amountPaid } = req.body || {};
    try {
        const fee = await Fee.findById(req.params.id);
        if (!fee) return res.status(404).json({ message: "Fee record not found" });

        const add = Number(amountPaid ?? fee.amount);
        const nextPaid = Math.max(0, Math.min(fee.amount, (fee.paidAmount || 0) + (Number.isFinite(add) ? add : 0)));
        fee.paidAmount = nextPaid;
        fee.status = nextPaid >= fee.amount ? "Paid" : nextPaid > 0 ? "Partial" : "Pending";
        fee.paymentDate = new Date();
        if (transactionId) fee.transactionId = transactionId;

        await fee.save();
        res.status(200).json({ message: "Payment processed successfully", fee });
    } catch (error) {
        res.status(500).json({ message: "Error processing payment", error: error.message });
    }
};

// Get all fees with filter and search
export const getAllFees = async (req, res) => {
    try {
        const { status, type, search } = req.query;
        const query = {};
        if (status) query.status = status;
        if (type) query.type = type;
        
        if (search) {
            const students = await Student.find({
                $or: [
                    { rollNumber: { $regex: search, $options: "i" } },
                    { rollNo: { $regex: search, $options: "i" } }
                ]
            }).select("_id");
            query.student = { $in: students.map(s => s._id) };
        }

        const fees = await Fee.find(query).populate({
            path: "student",
            populate: [
                { path: "user", select: "name email profilePicture" },
                { path: "course", select: "name code" }
            ]
        });
        res.status(200).json(fees);
    } catch (error) {
        res.status(500).json({ message: "Error fetching fees", error: error.message });
    }
};

// Get fees by student
export const getStudentFees = async (req, res) => {
    try {
        const fees = await Fee.find({ student: req.params.studentId }).populate({
            path: "student",
            populate: [
                { path: "user", select: "name email profilePicture" },
                { path: "course", select: "name code" }
            ]
        });
        res.status(200).json(fees);
    } catch (error) {
        res.status(500).json({ message: "Error fetching student fees", error: error.message });
    }
};

// Get pending fee reports
export const getPendingFeesReport = async (req, res) => {
    try {
        const pendingFees = await Fee.find({ status: { $ne: "Paid" } }).populate({
            path: "student",
            populate: { path: "user", select: "name" }
        });
        res.status(200).json(pendingFees);
    } catch (error) {
        res.status(500).json({ message: "Error generating report", error: error.message });
    }
};

// Frontend compatibility: /fees/transactions
export const getFeeTransactions = async (req, res) => {
    try {
        const fees = await Fee.find({ transactionId: { $exists: true, $ne: null } })
            .populate({
                path: "student",
                populate: [
                    { path: "user", select: "name email profilePicture" },
                    { path: "course", select: "name code" }
                ]
            })
            .sort({ paymentDate: -1, updatedAt: -1 });
        res.status(200).json(fees);
    } catch (error) {
        res.status(500).json({ message: "Error fetching fee transactions", error: error.message });
    }
};

// Frontend compatibility: /fees/stats
export const getFeeStats = async (_req, res) => {
    try {
        const [totalRecords, totalPaidAmountAgg, pendingCount, paidCount] = await Promise.all([
            Fee.countDocuments(),
            Fee.aggregate([
                { $match: { status: "Paid" } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            Fee.countDocuments({ status: { $ne: "Paid" } }),
            Fee.countDocuments({ status: "Paid" })
        ]);

        res.status(200).json({
            totalRecords,
            paidCount,
            pendingCount,
            totalPaidAmount: totalPaidAmountAgg[0]?.total || 0
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching fee stats", error: error.message });
    }
};

// Frontend compatibility: /fees/collect
export const collectFee = async (req, res) => {
    try {
        const feeId = req.body?.id || req.body?.feeId;
        if (!feeId) {
            return res.status(400).json({ message: "feeId (or id) is required" });
        }

        const fee = await Fee.findById(feeId);
        if (!fee) return res.status(404).json({ message: "Fee record not found" });

        const add = Number(req.body?.amountPaid ?? fee.amount);
        const nextPaid = Math.max(0, Math.min(fee.amount, (fee.paidAmount || 0) + (Number.isFinite(add) ? add : 0)));
        fee.paidAmount = nextPaid;
        fee.status = nextPaid >= fee.amount ? "Paid" : nextPaid > 0 ? "Partial" : "Pending";
        fee.paymentDate = new Date();
        if (req.body?.transactionId) fee.transactionId = req.body.transactionId;

        await fee.save();
        res.status(200).json({ message: "Payment processed successfully", fee });
    } catch (error) {
        res.status(500).json({ message: "Error processing payment", error: error.message });
    }
};
