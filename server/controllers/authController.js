/**
 * @file Controller for handling authentication-related requests (signup, login).
 * @module controllers/authController
 */

const userModel = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const {
    BadRequestError,
    UnauthorizedError,
    NotFoundError,
    AppError,
} = require('../utils/appError');

/**
 * Handles user signup.
 * Validates input, hashes password, creates a new user, and sends a success response.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
exports.signup = async (req, res, next) => {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
        return next(new BadRequestError('Username, password, and email are required'));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return next(new BadRequestError('Invalid email format'));
    }

    try {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const newUser = await userModel.createUser(username, hashedPassword, email);
        res.status(201).json({
            message: 'success',
            data: newUser,
        });
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed: users.username')) {
            return next(new BadRequestError('Username already taken'));
        }
        if (err.message.includes('UNIQUE constraint failed: users.email')) {
            return next(new BadRequestError('Email already registered'));
        }
        next(new AppError(err.message, 400)); // Use AppError for generic errors
    }
};

/**
 * Handles user login.
 * Validates input, verifies credentials, generates a JWT, and sends a success response with token and user data.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
exports.login = async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return next(new BadRequestError('Username and password are required'));
    }

    try {
        const user = await userModel.findUserByUsername(username);

        if (!user) {
            return next(new NotFoundError('User not found'));
        }

        if (!bcrypt.compareSync(password, user.password)) {
            return next(new UnauthorizedError('Incorrect password'));
        }

        // Generate JWT
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: '1h', // Token expires in 1 hour
        });

        res.json({
            message: 'success',
            token: token, // Return the token
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (err) {
        console.error('Login error:', err.message);
        next(new AppError(err.message, 400)); // Use AppError for generic errors
    }
};

/**
 * Handles JWT token refresh.
 * Generates a new JWT for the authenticated user and sends it in the response.
 * @param {object} req - The Express request object, with user attached by authMiddleware.
 * @param {object} res - The Express response object.
 */
exports.refreshToken = (req, res) => {
    const user = req.user; // req.user is populated by authMiddleware

    // Issue a new token with a new expiration time
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // It's good practice to send back the user data along with the new token
    const userData = { id: user.id, username: user.username, email: user.email };

    res.status(200).json({
        message: 'success',
        token: token,
        data: userData,
    });
};
