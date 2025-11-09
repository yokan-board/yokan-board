/**
 * @file Middleware for handling validation results from express-validator.
 * @module middleware/validationMiddleware
 */

const { validationResult } = require('express-validator');
const { BadRequestError } = require('../utils/appError');

/**
 * Middleware to check for validation errors from express-validator.
 * If validation errors are present, it creates a BadRequestError and passes it to the next middleware.
 * Otherwise, it calls the next middleware.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 * @returns {void}
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = errors.array().map((err) => {
        if (err.param === undefined && err.msg === 'Please include a valid email') {
            return `email: ${err.msg}`;
        }
        return `${err.param}: ${err.msg}`;
    });
    return next(new BadRequestError(`Validation failed: ${extractedErrors.join(', ')}`));
};

module.exports = { validate };
