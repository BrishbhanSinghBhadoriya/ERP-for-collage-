import mongoose from "mongoose";

const ExamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    semester: { type: Number, required: true },
    date: { type: Date, required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    maxMarks: { type: Number, required: true }
}, { timestamps: true });

const Exam = mongoose.model("Exam", ExamSchema);
export default Exam;
