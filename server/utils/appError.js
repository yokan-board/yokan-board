/**
 * @file Defines custom error classes for the application.
 * @module utils/appError
 */

/**
 * @class AppError
 * @augments Error
 * @description Base custom error class for handling operational errors.
 */
class AppError extends Error {
    /**
     * Creates an instance of AppError.
     * @param {string} message - The error message.
     * @param {number} statusCode - The HTTP status code associated with the error.
     */
    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * @class BadRequestError
 * @augments AppError
 * @description Custom error class for 400 Bad Request errors.
 */
class BadRequestError extends AppError {
    /**
     * Creates an instance of BadRequestError.
     * @param {string} [message='Bad Request'] - The error message.
     */
    constructor(message = 'Bad Request') {
        super(message, 400);
    }
}

/**
 * @class UnauthorizedError
 * @augments AppError
 * @description Custom error class for 401 Unauthorized errors.
 */
class UnauthorizedError extends AppError {
    /**
     * Creates an instance of UnauthorizedError.
     * @param {string} [message='Unauthorized'] - The error message.
     */
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}

/**
 * @class ForbiddenError
 * @augments AppError
 * @description Custom error class for 403 Forbidden errors.
 */
class ForbiddenError extends AppError {
    /**
     * Creates an instance of ForbiddenError.
     * @param {string} [message='Forbidden'] - The error message.
     */
    constructor(message = 'Forbidden') {
        super(message, 403);
    }
}

/**
 * @class NotFoundError
 * @augments AppError
 * @description Custom error class for 404 Not Found errors.
 */
class NotFoundError extends AppError {
    /**
     * Creates an instance of NotFoundError.
     * @param {string} [message='Not Found'] - The error message.
     */
    constructor(message = 'Not Found') {
        super(message, 404);
    }
}

module.exports = {
    AppError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
};
