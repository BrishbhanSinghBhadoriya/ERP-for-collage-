import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, unique: true, required: true },
    department: { type: String, required: true },
    durationYears: { type: Number, required: true },
    semesters: { type: Number, required: true },
    feeStructure: [
        {
            semester: { type: Number, required: true },
            amount: { type: Number, required: true }
        }
    ]
}, { timestamps: true });

const Course = mongoose.model("Course", CourseSchema);
export default Course;
