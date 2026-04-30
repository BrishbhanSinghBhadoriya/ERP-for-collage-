import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./src/config/db.js";
import userRoutes from "./src/routes/userRoutes.js";
import uploadRoutes from "./src/routes/uploadRoutes.js";
import leaveRoutes from "./src/routes/leaveRoutes.js";
import hrRouter from "./src/routes/hrRoutes.js";
import announcementRoutes from "./src/routes/announcementRoutes.js";
import attendanceRoutes from "./src/routes/attendanceRoutes.js";
import kraRoutes from "./src/routes/kraManagementRoutes.js";
import salaryRoutes from "./src/routes/salaryRoutes.js";
import studentRoutes from "./src/routes/studentRoutes.js";
import academicsRoutes from "./src/routes/academicsRoutes.js";
import studentAttendanceRoutes from "./src/routes/studentAttendanceRoutes.js";
import feeRoutes from "./src/routes/feeRoutes.js";
import examRoutes from "./src/routes/examRoutes.js";
import resultRoutes from "./src/routes/resultRoutes.js";
import libraryRoutes from "./src/routes/libraryRoutes.js";
import activityRoutes from "./src/routes/activityRoutes.js";
import holidayRoutes from "./src/routes/holidayRoutes.js";
import systemSettingsRoutes from "./src/routes/systemSettingsRoutes.js";

import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import { errorHandler, notFound } from "./src/middleware/errorMiddleware.js";
import cors from "cors";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, ".env.local"), override: true });
const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000,http://localhost:5173,https://erp-for-collage-zh9p.vercel.app")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // allow server-to-server/curl requests without origin
    if (!origin) return callback(null, true);
    if (!allowedOrigins.includes(origin)) {
      return callback(new Error("Origin not allowed by CORS"), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Normalize double slashes in URLs
app.use((req, res, next) => {
  req.url = req.url.replace(/\/+/g, '/');
  next();
});

app.use("/api/users", userRoutes);
app.use("/api/auth", userRoutes); // Alias for frontend
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/hr", hrRouter);
app.use("/api/faculty", hrRouter); // Alias for frontend
app.use("/api/api/hr", hrRouter); // Frontend compatibility for accidental double /api
app.use("/api/announcements", announcementRoutes);
app.use("/api/announcement", announcementRoutes); // Frontend compatibility (singular)
app.use("/api/attendance", attendanceRoutes);
app.use("/api/kra", kraRoutes);
app.use("/api/salary", salaryRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/academics", academicsRoutes);
app.get("/api/health", (_req, res) => res.status(200).json({ status: "ok" }));
app.use("/api", academicsRoutes); // Frontend compatibility for /api/courses and /api/subjects
app.use("/api/attendance/student", studentAttendanceRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/settings", systemSettingsRoutes);

app.use(notFound);
app.use(errorHandler);

app.get('/', (req, res) => {
	res.send("Hello World by hrms backend Brishbhan Singh Bhadoriya ");
});

const PORT = process.env.PORT || 5001;

/**
 * Auto-fix: Ensure the employeeId index is sparse so multiple users
 * (e.g. students) can have a null/missing employeeId without conflicts.
 * This runs once at startup and is a no-op if the index is already correct.
 */
const ensureSparseEmployeeIdIndex = async () => {
  try {
    if (!mongoose.connection?.db) return;
    const col = mongoose.connection.db.collection("users");
    const indexes = await col.indexes();
    const idx = indexes.find(i => i.name === "employeeId_1");
    if (idx && !idx.sparse) {
      await col.dropIndex("employeeId_1");
      await col.createIndex({ employeeId: 1 }, { unique: true, sparse: true, name: "employeeId_1" });
      console.log("✅ [startup] Rebuilt employeeId_1 index as unique + sparse.");
    }
  } catch (err) {
    console.warn("⚠️  [startup] Could not verify employeeId index:", err.message);
  }
};

const startServer = async () => {
  try {
    await connectDB();
    await ensureSparseEmployeeIdIndex();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
