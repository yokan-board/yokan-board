/**
 * @file Middleware for fetching a board by ID and attaching it to the request object.
 * @module middleware/boardMiddleware
 */

const boardModel = require('../models/board');
const { NotFoundError, AppError } = require('../utils/appError');

/**
 * Middleware to fetch a board by its ID from the request parameters.
 * If the board is found, it attaches the board object to `req.board`.
 * If not found, it passes a NotFoundError to the next middleware.
 * @param {object} req - The Express request object, expected to have `req.params.id`.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 * @returns {void}
 */
const getBoardMiddleware = async (req, res, next) => {
    const { id } = req.params;
    try {
        const board = await boardModel.getBoardById(id);
        if (!board) {
            return next(new NotFoundError('Board not found'));
        }
        req.board = board; // Attach board to request
        next();
    } catch (err) {
        next(new AppError(err.message, 400)); // Use AppError for generic errors
    }
};

module.exports = { getBoardMiddleware };
