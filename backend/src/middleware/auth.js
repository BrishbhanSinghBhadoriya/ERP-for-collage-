// middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/userSchema.js';

export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Access token required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'User not found'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                status: 'error',
                message: 'Account is deactivated'
            });
        }

        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ status: 'error', message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ status: 'error', message: 'Token expired' });
        }

        console.error('Auth middleware error:', error);
        return res.status(500).json({ status: 'error', message: 'Authentication error' });
    }
};


// Role-based middleware
export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        const rawRole = req.user?.role;
        const normalizedRole = typeof rawRole === "string" ? rawRole.replace(/_/g, " ").trim() : rawRole;
        const allowed = allowedRoles.includes(rawRole) || allowedRoles.includes(normalizedRole);
        if (!allowed) {
            return res.status(403).json({
                status: 'error',
                message: 'Forbidden: You do not have access to this resource'
            });
        }
        next();
    };
};

// Register guard:
// - If system has no users, first user can be created without auth (bootstrap).
// - After bootstrap, only admin/hr can create users.
export const allowInitialAdminOrAuthorizedCreator = async (req, res, next) => {
    try {
        const usersCount = await User.estimatedDocumentCount();
        if (usersCount === 0) {
            return next();
        }

        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Only admin/hr can create users after initial setup. Please login first.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const creator = await User.findById(decoded.userId).select('-password');

        if (!creator || !creator.isActive) {
            return res.status(401).json({
                status: 'error',
                message: 'Creator account is invalid or deactivated'
            });
        }

        if (!['admin', 'hr'].includes(creator.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'Only admin/hr can create users'
            });
        }

        req.user = creator;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ status: 'error', message: 'Invalid or expired token' });
        }
        console.error('Register guard error:', error);
        return res.status(500).json({ status: 'error', message: 'Unable to verify creator permissions' });
    }
};
