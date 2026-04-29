import dotenv from "dotenv";
import mongoose from "mongoose";
import Course from "../src/models/CourseSchema.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/unifost-hrms";

const courses = [
  {
    name: "Bachelor of Computer Applications",
    code: "BCA",
    department: "Computer Science",
    durationYears: 3,
    semesters: 6,
    feeStructure: [
      { semester: 1, amount: 32000 },
      { semester: 2, amount: 32000 },
      { semester: 3, amount: 34000 },
      { semester: 4, amount: 34000 },
      { semester: 5, amount: 36000 },
      { semester: 6, amount: 36000 }
    ]
  },
  {
    name: "Bachelor of Technology - CSE",
    code: "BTECH-CSE",
    department: "Engineering",
    durationYears: 4,
    semesters: 8,
    feeStructure: [
      { semester: 1, amount: 60000 },
      { semester: 2, amount: 60000 },
      { semester: 3, amount: 62000 },
      { semester: 4, amount: 62000 },
      { semester: 5, amount: 65000 },
      { semester: 6, amount: 65000 },
      { semester: 7, amount: 68000 },
      { semester: 8, amount: 68000 }
    ]
  },
  {
    name: "Bachelor of Business Administration",
    code: "BBA",
    department: "Management",
    durationYears: 3,
    semesters: 6,
    feeStructure: [
      { semester: 1, amount: 28000 },
      { semester: 2, amount: 28000 },
      { semester: 3, amount: 30000 },
      { semester: 4, amount: 30000 },
      { semester: 5, amount: 32000 },
      { semester: 6, amount: 32000 }
    ]
  },
  {
    name: "Bachelor of Commerce",
    code: "BCOM",
    department: "Commerce",
    durationYears: 3,
    semesters: 6,
    feeStructure: [
      { semester: 1, amount: 22000 },
      { semester: 2, amount: 22000 },
      { semester: 3, amount: 24000 },
      { semester: 4, amount: 24000 },
      { semester: 5, amount: 26000 },
      { semester: 6, amount: 26000 }
    ]
  },
  {
    name: "Bachelor of Science - Mathematics",
    code: "BSC-MATH",
    department: "Science",
    durationYears: 3,
    semesters: 6,
    feeStructure: [
      { semester: 1, amount: 25000 },
      { semester: 2, amount: 25000 },
      { semester: 3, amount: 27000 },
      { semester: 4, amount: 27000 },
      { semester: 5, amount: 29000 },
      { semester: 6, amount: 29000 }
    ]
  },
  {
    name: "Master of Computer Applications",
    code: "MCA",
    department: "Computer Science",
    durationYears: 2,
    semesters: 4,
    feeStructure: [
      { semester: 1, amount: 45000 },
      { semester: 2, amount: 45000 },
      { semester: 3, amount: 47000 },
      { semester: 4, amount: 47000 }
    ]
  }
];

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    for (const course of courses) {
      await Course.updateOne({ code: course.code }, { $set: course }, { upsert: true });
    }

    const savedCourses = await Course.find({}, "name code department semesters").sort({ code: 1 }).lean();
    const departments = [...new Set(savedCourses.map((c) => c.department))];

    console.log(`Seeded/updated courses: ${savedCourses.length}`);
    console.log(`Departments available for dropdown: ${departments.join(", ")}`);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();

