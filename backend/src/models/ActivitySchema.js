import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    venue: { type: String },
    type: { type: String, enum: ["Sports", "Cultural", "Technical", "Other"], default: "Other" },
    participants: [
        {
            student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
            role: { type: String }, // e.g., "Participant", "Winner", "Runner-up"
            remarks: { type: String }
        }
    ]
}, { timestamps: true });

const Activity = mongoose.model("Activity", ActivitySchema);
export default Activity;
