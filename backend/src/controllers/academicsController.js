import Course from "../models/CourseSchema.js";
import Subject from "../models/SubjectSchema.js";
import Student from "../models/StudentSchema.js";

// Course Controllers
export const createCourse = async (req, res) => {
    try {
        const course = new Course(req.body);
        await course.save();
        res.status(201).json({ message: "Course created successfully", course });
    } catch (error) {
        res.status(500).json({ message: "Error creating course", error: error.message });
    }
};

export const getAllCourses = async (req, res) => {
    try {
        const { search, department } = req.query;
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { code: { $regex: search, $options: "i" } }
            ];
        }
        if (department) {
            query.department = department;
        }
        const courses = await Course.find(query);
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: "Error fetching courses", error: error.message });
    }
};

export const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: "Course not found" });
        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ message: "Error fetching course", error: error.message });
    }
};

export const updateCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!course) return res.status(404).json({ message: "Course not found" });
        res.status(200).json({ message: "Course updated successfully", course });
    } catch (error) {
        res.status(500).json({ message: "Error updating course", error: error.message });
    }
};

export const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) return res.status(404).json({ message: "Course not found" });
        res.status(200).json({ message: "Course deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting course", error: error.message });
    }
};

export const getDepartments = async (req, res) => {
    try {
        const departments = await Course.distinct("department");
        res.status(200).json(departments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching departments", error: error.message });
    }
};

// Subject Controllers
export const createSubject = async (req, res) => {
    try {
        const subject = new Subject(req.body);
        await subject.save();
        res.status(201).json({ message: "Subject created successfully", subject });
    } catch (error) {
        res.status(500).json({ message: "Error creating subject", error: error.message });
    }
};

export const getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find().populate("course").populate("faculty", "name email");
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: "Error fetching subjects", error: error.message });
    }
};

export const getSubjectsByCourse = async (req, res) => {
    try {
        const subjects = await Subject.find({ course: req.params.courseId }).populate("faculty", "name email");
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: "Error fetching subjects", error: error.message });
    }
};

export const updateSubject = async (req, res) => {
    try {
        const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!subject) return res.status(404).json({ message: "Subject not found" });
        res.status(200).json({ message: "Subject updated successfully", subject });
    } catch (error) {
        res.status(500).json({ message: "Error updating subject", error: error.message });
    }
};

export const deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.findByIdAndDelete(req.params.id);
        if (!subject) return res.status(404).json({ message: "Subject not found" });
        res.status(200).json({ message: "Subject deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting subject", error: error.message });
    }
};

// Course-wise stats for UI cards
// Returns each course with computed:
// - totalStudents
// - totalSubjects
export const getCourseStats = async (_req, res) => {
    try {
        const courses = await Course.find();

        // Use countDocuments per course to avoid aggregate pipeline edge-cases.
        const enriched = await Promise.all(
            courses.map(async (course) => {
                const [totalStudents, totalSubjects] = await Promise.all([
                    Student.countDocuments({ course: course._id }),
                    Subject.countDocuments({ course: course._id }),
                ]);

                return {
                    ...course.toObject(),
                    totalStudents,
                    totalSubjects,
                };
            })
        );

        res.status(200).json(enriched);
    } catch (error) {
        console.error("getCourseStats error:", error);
        res.status(500).json({
            message: "Error fetching course stats",
            error: error?.message,
            stack: error?.stack,
        });
    }
};
