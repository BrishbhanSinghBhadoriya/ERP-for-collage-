import express from "express";
import multer from "multer";
import { authenticateToken } from "../middleware/auth.js";
import { getEmployeebypagination } from "../controllers/employeeController.js";
import { getAttendance, markAttendance, updateAttendance, deleteAttendance, markBulkAttendance, getTodayAttendanceSummary } from "../controllers/attendanceController.js";
import { 
  createAnnouncement, 
  getAnnouncement, 
  getEmployee, 
  getEmployeeById, 
  getHrDashboardWithAttendance, 
  updateEmployeeSalary,
  getDepartments,
  getDesignations,
  registerEmployee,
  updateEmployee,
  deleteEmployee,
  getUpcomingLeave,
  getforgetPasswordRequest,
  editPassword,
  importEmployees
} from "../controllers/hrController.js"

const hrRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Departments & Designations
hrRouter.get("/departments", authenticateToken, getDepartments);
hrRouter.get("/designations", authenticateToken, getDesignations);

// Employee CRUD
hrRouter.get("/employees", authenticateToken, getEmployee);
hrRouter.get("/", authenticateToken, getEmployee); // Alias for /faculty
hrRouter.post("/employees/register", authenticateToken, registerEmployee);
hrRouter.post("/", authenticateToken, registerEmployee); // Alias for /faculty
hrRouter.post("/employees/import", authenticateToken, upload.single("file"), importEmployees);
hrRouter.get("/employees/:id", authenticateToken, getEmployeeById);
hrRouter.get("/:id", authenticateToken, getEmployeeById); // Alias for /faculty
hrRouter.put("/employees/:id", authenticateToken, updateEmployee);
hrRouter.put("/:id", authenticateToken, updateEmployee); // Alias for /faculty
hrRouter.delete("/employees/:id", authenticateToken, deleteEmployee);
hrRouter.delete("/:id", authenticateToken, deleteEmployee); // Alias for /faculty

// Attendance
hrRouter.post("/markAttendance/:id", authenticateToken, markAttendance);
hrRouter.post("/bulkAttendance", authenticateToken, markBulkAttendance);
hrRouter.get('/getAttendance', authenticateToken, getAttendance)
hrRouter.put('/updateAttendance/:id', authenticateToken, updateAttendance)
hrRouter.delete('/deleteAttendance/:id', authenticateToken, deleteAttendance)
hrRouter.get('/getTodayAttendanceSummary', authenticateToken, getTodayAttendanceSummary)

// HR Dashboard & Stats
hrRouter.get('/getHrDashboardWithAttendance', authenticateToken, getHrDashboardWithAttendance)
hrRouter.get('/getupcomingLeaves', authenticateToken, getUpcomingLeave)

// Announcements
hrRouter.post('/createAnnouncement', authenticateToken, createAnnouncement)
hrRouter.get('/getAnnouncement', authenticateToken, getAnnouncement)

// Salary & Password
hrRouter.put("/employee-salary/:employeeId", authenticateToken, updateEmployeeSalary);
hrRouter.get("/getforgetPasswordRequest", authenticateToken, getforgetPasswordRequest);
hrRouter.put("/reset-password", authenticateToken, editPassword)

// Legacy routes (keeping for compatibility if needed, but pointing to new controllers)
hrRouter.get("/getEmployees", authenticateToken, getEmployee);
hrRouter.get("/getEmployee/:id", authenticateToken, getEmployeeById);
hrRouter.delete('/deleteEmployee/:id', authenticateToken, deleteEmployee)
hrRouter.get("/getEmployeesbypagination", authenticateToken, getEmployeebypagination);



export default hrRouter;
