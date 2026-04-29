import mongoose from "mongoose";

const BookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    isbn: { type: String, unique: true, required: true },
    category: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: null },
    totalCopies: { type: Number, required: true, default: 1 },
    availableCopies: { type: Number, required: true, default: 1 },
    location: { type: String }, // e.g., "Shelf A-1"
    issuedTo: [
        {
            student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
            issueDate: { type: Date, default: Date.now },
            returnDate: { type: Date },
            status: { type: String, enum: ["Issued", "Returned"], default: "Issued" }
        }
    ]
}, { timestamps: true });

const Book = mongoose.model("Book", BookSchema);
export default Book;
