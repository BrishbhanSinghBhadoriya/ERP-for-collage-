import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rollNumber: { type: String, unique: true, required: true },
    rollNo: { type: String, unique: true, sparse: true }, // Alias for rollNumber
    enrollmentNumber: { type: String, unique: true, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    year: { type: Number, default: 1 }, // Added year field
    semester: { type: Number, required: true, default: 1 },
    section: { type: String, required: true },
    admissionDate: { type: Date, default: Date.now },
    guardianName: { type: String, required: true },
    guardianContact: { type: String, required: true },
    academicHistory: [
        {
            year: { type: Number, required: true },
            school: { type: String, required: true },
            percentage: { type: Number, required: true }
        }
    ],
    status: { type: String, enum: ["Active", "Graduated", "Suspended"], default: "Active" }
}, { timestamps: true });

const Student = mongoose.model("Student", StudentSchema);
export default Student;
