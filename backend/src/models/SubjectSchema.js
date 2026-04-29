import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, unique: true, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    semester: { type: Number, required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Faculty are also Users
    credits: { type: Number, required: true }
}, { timestamps: true });

const Subject = mongoose.model("Subject", SubjectSchema);
export default Subject;
