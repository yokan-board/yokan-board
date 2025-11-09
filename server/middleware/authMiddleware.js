/**
 * @file Authentication middleware for verifying JWT tokens.
 * @module middleware/authMiddleware
 */

const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../utils/appError');
const userModel = require('../models/user'); // Import user model

/**
 * Middleware to authenticate users based on JWT token.
 * Verifies the token, fetches the corresponding user from the database,
 * and attaches the user object to the request object.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
const authenticateUser = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new UnauthorizedError('No token provided, authorization denied'));
    }

    try {
        // 1. Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 2. Check if user still exists
        const currentUser = await userModel.findUserById(decoded.id);
        if (!currentUser) {
            return next(new UnauthorizedError('User belonging to this token no longer exists.'));
        }

        // 3. Grant access to protected route
        req.user = currentUser; // Attach full user object to the request
        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return next(new UnauthorizedError('Invalid token'));
        }
        if (err.name === 'TokenExpiredError') {
            return next(new UnauthorizedError('Token expired'));
        }
        next(new UnauthorizedError('Invalid token'));
    }
};

module.exports = authenticateUser;
