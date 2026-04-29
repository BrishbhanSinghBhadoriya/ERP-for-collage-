import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    marksObtained: { type: Number, required: true },
    grade: { type: String, required: true },
    remarks: { type: String }
}, { timestamps: true });

const Result = mongoose.model("Result", ResultSchema);
export default Result;
