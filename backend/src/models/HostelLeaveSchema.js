import mongoose from "mongoose";

const HostelLeaveSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    
    // Approval Workflow
    wardenStatus: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    hodStatus: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    finalStatus: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    
    wardenRemarks: { type: String, default: "" },
    hodRemarks: { type: String, default: "" },
    
    forwardedToHOD: { type: Boolean, default: false },
    forwardedToStudent: { type: Boolean, default: false },
    
    // Timestamps for tracking
    wardenActionDate: { type: Date },
    hodActionDate: { type: Date },
    finalForwardDate: { type: Date }
}, { timestamps: true });

const HostelLeave = mongoose.model("HostelLeave", HostelLeaveSchema);
export default HostelLeave;
