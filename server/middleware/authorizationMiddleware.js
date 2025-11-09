/**
 * @file Authorization middleware for checking resource ownership.
 * @module middleware/authorizationMiddleware
 */

const { AppError, ForbiddenError } = require('../utils/appError');

/**
 * Middleware to check if the authenticated user is the owner of the board.
 * Requires `req.board` to be populated by `getBoardMiddleware` and `req.user_id` from `authenticateUser`.
 * @param {object} req - The Express request object, expected to have `req.board` and `req.user_id`.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 * @returns {void}
 */
const isOwner = (req, res, next) => {
    if (!req.board) {
        return next(
            new AppError('Board not found in request. Ensure getBoardMiddleware is used.', 500)
        );
    }
    if (Number(req.user.id) !== Number(req.board.user_id)) {
        return next(new ForbiddenError('Forbidden: You do not own this resource'));
    }
    next();
};

module.exports = { isOwner };
