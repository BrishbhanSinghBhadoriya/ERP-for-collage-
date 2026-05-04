import dotenv from "dotenv";
import mongoose from "mongoose";
import Course from "./src/models/CourseSchema.js";
import Subject from "./src/models/SubjectSchema.js";
import User from "./src/models/userSchema.js";
import Student from "./src/models/StudentSchema.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("MONGO_URI is not defined in .env");
    process.exit(1);
}

const run = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        // 1. Get an Admin or Professor user to assign as faculty
        let faculty = await User.findOne({ role: { $in: ["admin", "professor", "faculty", "assistant professor"] } });
        
        if (!faculty) {
            console.log("No faculty/admin user found. Creating a default faculty user...");
            faculty = new User({
                username: "default_faculty",
                password: "password123", // In real app use hashed password
                name: "Default Faculty",
                email: "faculty@erp.com",
                role: "professor",
                isActive: true
            });
            await faculty.save();
        }

        const coursesData = [
            { name: "Bachelor of Computer Applications", code: "BCA", department: "Computer Science", durationYears: 3, semesters: 6 },
            { name: "Bachelor of Technology - CSE", code: "BTECH-CSE", department: "Engineering", durationYears: 4, semesters: 8 },
            { name: "Bachelor of Business Administration", code: "BBA", department: "Management", durationYears: 3, semesters: 6 }
        ];

        for (const c of coursesData) {
            const course = await Course.findOneAndUpdate(
                { code: c.code },
                { $set: { ...c, feeStructure: [{ semester: 1, amount: 30000 }] } },
                { upsert: true, new: true }
            );
            console.log(`Course ${course.code} ready.`);

            // Create subjects for each course
            const subjectsData = [
                { name: `${course.code} Programming 101`, code: `${course.code}-P101`, semester: 1, credits: 4 },
                { name: `${course.code} Mathematics 101`, code: `${course.code}-M101`, semester: 1, credits: 3 },
                { name: `${course.code} Communication Skills`, code: `${course.code}-CS101`, semester: 1, credits: 2 }
            ];

            for (const s of subjectsData) {
                await Subject.updateOne(
                    { code: s.code },
                    { 
                        $set: { 
                            ...s, 
                            course: course._id, 
                            faculty: faculty._id 
                        } 
                    },
                    { upsert: true }
                );
            }
            console.log(`Subjects for ${course.code} ready.`);

            // Create 2 students for each course
            for (let i = 1; i <= 2; i++) {
                const username = `student_${course.code.toLowerCase()}_${i}`;
                let user = await User.findOne({ username });
                if (!user) {
                    user = new User({
                        username,
                        password: "password123",
                        name: `Student ${course.code} ${i}`,
                        email: `${username}@erp.com`,
                        role: "student",
                        isActive: true,
                        isStudent: true
                    });
                    await user.save();
                }

                await Student.updateOne(
                    { user: user._id },
                    {
                        $set: {
                            rollNumber: `${course.code}-${100 + i}`,
                             rollNo: `${course.code}-${100 + i}`,
                             enrollmentNumber: `EN-${course.code}-${1000 + i}`,
                            course: course._id,
                            semester: 1,
                            section: "A",
                            guardianName: "Guardian",
                            guardianContact: "1234567890"
                        }
                    },
                    { upsert: true }
                );
            }
            console.log(`Students for ${course.code} ready.`);
        }

        console.log("Seeding completed successfully!");
    } catch (error) {
        console.error("Seeding failed:", error);
    } finally {
        await mongoose.connection.close();
    }
};

run();
