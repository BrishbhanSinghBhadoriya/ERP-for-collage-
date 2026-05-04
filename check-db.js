import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";

dotenv.config({ path: '../erp-backend/.env' });

const MONGO_URI = process.env.MONGO_URI;

const run = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");
        const db = mongoose.connection.db;
        const courses = await db.collection('courses').find({}).toArray();
        console.log("Courses found:", courses.length);
        console.log(JSON.stringify(courses, null, 2));
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.connection.close();
    }
};

run();
