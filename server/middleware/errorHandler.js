/**
 * @file Centralized error handling middleware for the Express application.
 * @module middleware/errorHandler
 */

const { AppError } = require('../utils/appError');

/**
 * Global error handling middleware.
 * Catches errors passed via `next(err)` and sends a standardized error response.
 * @param {AppError} err - The error object. Can be a custom AppError or a standard Error.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 */
const errorHandler = (err, req, res, next /* eslint-disable-line no-unused-vars */) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    });
};

module.exports = { errorHandler, AppError };
