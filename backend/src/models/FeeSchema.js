import mongoose from "mongoose";

const FeeSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    // Total fee for this record (e.g. semester tuition, exam fee etc.)
    amount: { type: Number, required: true },
    // Amount already paid against this fee record
    paidAmount: { type: Number, default: 0 },
    type: { type: String, enum: ["Tuition", "Library", "Exam", "Hostel"], required: true },
    status: { type: String, enum: ["Paid", "Pending", "Partial"], default: "Pending" },
    dueDate: { type: Date, required: true },
    paymentDate: { type: Date },
    transactionId: { type: String }
}, { timestamps: true });

const Fee = mongoose.model("Fee", FeeSchema);
export default Fee;
