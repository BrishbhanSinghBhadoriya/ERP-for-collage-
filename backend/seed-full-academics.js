import dotenv from "dotenv";
import mongoose from "mongoose";
import Course from "./src/models/CourseSchema.js";
import Subject from "./src/models/SubjectSchema.js";
import User from "./src/models/userSchema.js";
import Student from "./src/models/StudentSchema.js";
import Exam from "./src/models/ExamSchema.js";
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
        console.log("Connected to MongoDB Atlas");

        // 1. Find or Create Faculty
        let faculty = await User.findOne({ role: { $in: ["professor", "admin", "faculty"] } });
        if (!faculty) {
            faculty = new User({
                username: "saurabh_prof",
                password: "password123",
                name: "Prof. Saurabh Upadhyay",
                email: "saurabh@erp.com",
                role: "professor",
                isActive: true
            });
            await faculty.save();
        }

        // 2. Comprehensive Courses & Subjects Data
        const academicData = [
            {
                course: { name: "Bachelor of Computer Applications", code: "BCA", department: "IT", durationYears: 3, semesters: 6 },
                subjects: [
                    { name: "C Programming", code: "BCA-101", semester: 1, credits: 4 },
                    { name: "Digital Electronics", code: "BCA-102", semester: 1, credits: 3 },
                    { name: "Discrete Mathematics", code: "BCA-103", semester: 1, credits: 4 },
                    { name: "Web Technologies", code: "BCA-301", semester: 3, credits: 4 },
                    { name: "Database Management", code: "BCA-302", semester: 3, credits: 4 }
                ]
            },
            {
                course: { name: "B.Tech Computer Science", code: "BTECH-CSE", department: "Engineering", durationYears: 4, semesters: 8 },
                subjects: [
                    { name: "Data Structures", code: "CS-301", semester: 3, credits: 4 },
                    { name: "Operating Systems", code: "CS-401", semester: 4, credits: 4 },
                    { name: "Computer Networks", code: "CS-501", semester: 5, credits: 4 },
                    { name: "Theory of Computation", code: "CS-502", semester: 5, credits: 4 },
                    { name: "Compiler Design", code: "CS-601", semester: 6, credits: 4 }
                ]
            },
            {
                course: { name: "Master of Computer Applications", code: "MCA", department: "IT", durationYears: 2, semesters: 4 },
                subjects: [
                    { name: "Advanced Java", code: "MCA-101", semester: 1, credits: 4 },
                    { name: "Cloud Computing", code: "MCA-201", semester: 2, credits: 4 },
                    { name: "Artificial Intelligence", code: "MCA-301", semester: 3, credits: 4 }
                ]
            },
            {
                course: { name: "Bachelor of Business Administration", code: "BBA", department: "Management", durationYears: 3, semesters: 6 },
                subjects: [
                    { name: "Principles of Management", code: "BBA-101", semester: 1, credits: 3 },
                    { name: "Business Economics", code: "BBA-102", semester: 1, credits: 3 },
                    { name: "Marketing Management", code: "BBA-301", semester: 3, credits: 4 }
                ]
            }
        ];

        for (const data of academicData) {
            // Upsert Course
            const course = await Course.findOneAndUpdate(
                { code: data.course.code },
                { $set: { ...data.course, feeStructure: [{ semester: 1, amount: 35000 }] } },
                { upsert: true, new: true }
            );
            console.log(`\nCourse [${course.code}] updated/created.`);

            // Upsert Subjects for this Course
            for (const s of data.subjects) {
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
                console.log(`  - Subject: ${s.name} (${s.code})`);
            }

            // Create/Update Students for this Course (3 students each)
            for (let i = 1; i <= 3; i++) {
                const stuUsername = `stu_${course.code.toLowerCase()}_${i}`;
                let stuUser = await User.findOne({ username: stuUsername });
                if (!stuUser) {
                    stuUser = new User({
                        username: stuUsername,
                        password: "password123",
                        name: `Student ${course.code} ${i}`,
                        email: `${stuUsername}@college.edu`,
                        role: "student",
                        isActive: true,
                        isStudent: true
                    });
                    await stuUser.save();
                }

                await Student.updateOne(
                    { user: stuUser._id },
                    {
                        $set: {
                            rollNumber: `${course.code}-${200 + i}`,
                            rollNo: `${course.code}-${200 + i}`,
                            enrollmentNumber: `EN-${course.code}-2026-${i}`,
                            course: course._id,
                            semester: 1,
                            section: "A",
                            guardianName: "Parent",
                            guardianContact: "9998887770"
                        }
                    },
                    { upsert: true }
                );
            }
            console.log(`  - 3 Students seeded for ${course.code}`);

            // Seed 1 dummy exam for each course
            const exam = new Exam({
                name: "Mid-Semester Assessment",
                course: course._id,
                semester: 1,
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                subject: await Subject.findOne({ course: course._id }),
                maxMarks: 50
            });
            await exam.save();
            console.log(`  - Dummy exam seeded for ${course.code}`);
        }

        console.log("\nFull database seeding completed successfully!");
    } catch (error) {
        console.error("Seeding failed:", error);
    } finally {
        await mongoose.connection.close();
    }
};

run();
