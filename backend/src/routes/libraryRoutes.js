import express from "express";
import { 
    addBook, 
    getAllBooks, 
    issueBook, 
    returnBook,
    getLibraryStats,
    updateBook,
    deleteBook,
    getIssuedBooks
} from "../controllers/libraryController.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticateToken);

// Librarian (Staff), Admin can manage books
router.get("/books", getAllBooks);
router.get("/", getAllBooks);
router.get("/stats", getLibraryStats);
router.get("/issued", getIssuedBooks);
router.get("/books/course/:courseId", (_req, res) => res.status(200).json([]));
router.post("/books", authorizeRoles("admin", "staff", "hr"), addBook);
router.post("/", authorizeRoles("admin", "staff", "hr"), addBook);
router.put("/books/:id", authorizeRoles("admin", "staff", "hr"), updateBook);
router.delete("/books/:id", authorizeRoles("admin", "staff", "hr"), deleteBook);
router.post("/issue", authorizeRoles("admin", "staff", "hr"), issueBook);
router.post("/return", authorizeRoles("admin", "staff", "hr"), returnBook);

export default router;
