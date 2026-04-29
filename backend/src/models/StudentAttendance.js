import mongoose from "mongoose";

const StudentAttendanceSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["Present", "Absent", "Late"], default: "Present" },
    semester: { type: Number, required: true }
}, { timestamps: true });

const StudentAttendance = mongoose.model("StudentAttendance", StudentAttendanceSchema);
export default StudentAttendance;
