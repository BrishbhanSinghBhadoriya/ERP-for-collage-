import Book from "../models/BookSchema.js";
import Student from "../models/StudentSchema.js";

// Add a new book
export const addBook = async (req, res) => {
    try {
        const book = new Book(req.body);
        await book.save();
        res.status(201).json({ message: "Book added successfully", book });
    } catch (error) {
        res.status(500).json({ message: "Error adding book", error: error.message });
    }
};

// Get all books
export const getAllBooks = async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { author: { $regex: search, $options: "i" } },
                { isbn: { $regex: search, $options: "i" } }
            ];
        }
        if (category) {
            query.category = category;
        }
        const books = await Book.find(query).populate("course", "name code");
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: "Error fetching books", error: error.message });
    }
};

// Issue a book
export const issueBook = async (req, res) => {
    const { bookId, studentId } = req.body;
    try {
        const book = await Book.findById(bookId);
        if (!book) return res.status(404).json({ message: "Book not found" });
        if (book.availableCopies <= 0) {
            return res.status(400).json({ message: "No copies available" });
        }

        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ message: "Student not found" });

        book.issuedTo.push({ student: studentId, issueDate: new Date() });
        book.availableCopies -= 1;
        await book.save();

        res.status(200).json({ message: "Book issued successfully", book });
    } catch (error) {
        res.status(500).json({ message: "Error issuing book", error: error.message });
    }
};

// Return a book
export const returnBook = async (req, res) => {
    const { bookId, studentId } = req.body;
    try {
        const book = await Book.findById(bookId);
        if (!book) return res.status(404).json({ message: "Book not found" });

        const issueRecord = book.issuedTo.find(
            record => record.student.toString() === studentId && record.status === "Issued"
        );

        if (!issueRecord) {
            return res.status(400).json({ message: "No active issue record found for this student" });
        }

        issueRecord.status = "Returned";
        issueRecord.returnDate = new Date();
        book.availableCopies += 1;
        await book.save();

        res.status(200).json({ message: "Book returned successfully", book });
    } catch (error) {
        res.status(500).json({ message: "Error returning book", error: error.message });
    }
};

export const getLibraryStats = async (req, res) => {
    try {
        const [totalBooks, availableBooks, issuedBooksCount] = await Promise.all([
            Book.countDocuments(),
            Book.aggregate([{ $group: { _id: null, total: { $sum: "$availableCopies" } } }]),
            Book.aggregate([{ $project: { count: { $size: "$issuedTo" } } }, { $group: { _id: null, total: { $sum: "$count" } } }])
        ]);

        res.status(200).json({
            totalBooks,
            availableBooks: availableBooks[0]?.total || 0,
            issuedBooks: issuedBooksCount[0]?.total || 0
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching library stats", error: error.message });
    }
};

export const updateBook = async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!book) return res.status(404).json({ message: "Book not found" });
        res.status(200).json({ message: "Book updated successfully", book });
    } catch (error) {
        res.status(500).json({ message: "Error updating book", error: error.message });
    }
};

export const deleteBook = async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) return res.status(404).json({ message: "Book not found" });
        res.status(200).json({ message: "Book deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting book", error: error.message });
    }
};

export const getIssuedBooks = async (req, res) => {
    try {
        const books = await Book.find({ "issuedTo.status": "Issued" })
            .populate({
                path: "issuedTo.student",
                select: "rollNumber user",
                populate: { path: "user", select: "name email profilePicture" }
            })
            .select("_id title author course issuedTo");
        
        const issuedList = books.flatMap(book => 
            book.issuedTo
                .filter(record => record.status === "Issued")
                .map(record => ({
                    bookId: book._id,
                    bookTitle: book.title,
                    author: book.author,
                    course: book.course,
                    studentId: record.student?._id,
                    student: {
                        id: record.student?._id,
                        name: record.student?.user?.name || null,
                        rollNumber: record.student?.rollNumber || null,
                        profilePicture: record.student?.user?.profilePicture || null,
                    },
                    issueDate: record.issueDate
                }))
        );

        res.status(200).json(issuedList);
    } catch (error) {
        res.status(500).json({ message: "Error fetching issued books", error: error.message });
    }
};
