import { validationResult, body } from 'express-validator';

// Middleware to handle validation errors
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: 'error',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// Auth validation rules
export const registerValidation = [
    body('username').notEmpty().withMessage('Username is required').trim(),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role').optional().isIn([
        'admin', 'hod', 'professor', 'assistant professor', 'staff', 'student',
        'hr', 'registrar', 'bursar', 'employee', 'manager', 'faculty'
    ]).withMessage('Invalid role'),
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
    validate
];

export const loginValidation = [
    body('username').notEmpty().withMessage('Username is required').trim(),
    body('password').notEmpty().withMessage('Password is required'),
    validate
];

// Student validation rules
export const studentValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('rollNo').optional().notEmpty().withMessage('Roll Number is required'),
    body('course').notEmpty().withMessage('Course ID is required'),
    validate
];
