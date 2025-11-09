/**
 * @file Defines API routes for managing Kanban boards.
 * @module routes/boards
 */

const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authMiddleware');
const { getBoardMiddleware } = require('../middleware/boardMiddleware');
const { isOwner } = require('../middleware/authorizationMiddleware');
const boardController = require('../controllers/boardController');
const { createBoardValidation, updateBoardValidation } = require('../validation/boardValidation');
const { validate } = require('../middleware/validationMiddleware');

/**
 * Route for getting all boards for a specific user.
 * @name GET /users/:id/boards
 * @function
 * @memberof module:routes/boards
 * @param {function} authenticateUser - Middleware to authenticate the user.
 * @param {function} boardController.getAllBoardsForUser - Controller function to get all boards for a user.
 */
router.get('/users/:id/boards', authenticateUser, boardController.getAllBoardsForUser);

/**
 * Route for getting a single board by ID.
 * @name GET /boards/:id
 * @function
 * @memberof module:routes/boards
 * @param {function} authenticateUser - Middleware to authenticate the user.
 * @param {function} getBoardMiddleware - Middleware to fetch the board and attach to request.
 * @param {function} isOwner - Middleware to check if the user is the owner of the board.
 * @param {function} boardController.getBoardById - Controller function to get a board by ID.
 */
router.get(
    '/boards/:id',
    authenticateUser,
    getBoardMiddleware,
    isOwner,
    boardController.getBoardById
);

/**
 * Route for creating a new board.
 * @name POST /boards
 * @function
 * @memberof module:routes/boards
 * @param {function} authenticateUser - Middleware to authenticate the user.
 * @param {Array<function>} createBoardValidation - Middleware for validating board creation input.
 * @param {function} validate - Middleware for handling validation results.
 * @param {function} boardController.createBoard - Controller function to create a new board.
 */
router.post(
    '/boards',
    authenticateUser,
    createBoardValidation,
    validate,
    boardController.createBoard
);

/**
 * Route for updating an existing board.
 * @name PUT /boards/:id
 * @function
 * @memberof module:routes/boards
 * @param {function} authenticateUser - Middleware to authenticate the user.
 * @param {function} getBoardMiddleware - Middleware to fetch the board and attach to request.
 * @param {function} isOwner - Middleware to check if the user is the owner of the board.
 * @param {Array<function>} updateBoardValidation - Middleware for validating board update input.
 * @param {function} validate - Middleware for handling validation results.
 * @param {function} boardController.updateBoard - Controller function to update a board.
 */
router.put(
    '/boards/:id',
    authenticateUser,
    getBoardMiddleware,
    isOwner,
    updateBoardValidation,
    validate,
    boardController.updateBoard
);

/**
 * Route for deleting a board.
 * @name DELETE /boards/:id
 * @function
 * @memberof module:routes/boards
 * @param {function} authenticateUser - Middleware to authenticate the user.
 * @param {function} getBoardMiddleware - Middleware to fetch the board and attach to request.
 * @param {function} isOwner - Middleware to check if the user is the owner of the board.
 * @param {function} boardController.deleteBoard - Controller function to delete a board.
 */
router.delete(
    '/boards/:id',
    authenticateUser,
    getBoardMiddleware,
    isOwner,
    boardController.deleteBoard
);

/**
 * Route for exporting board data as JSON.
 * @name GET /boards/:id/export/json
 * @function
 * @memberof module:routes/boards
 * @param {function} authenticateUser - Middleware to authenticate the user.
 * @param {function} getBoardMiddleware - Middleware to fetch the board and attach to request.
 * @param {function} isOwner - Middleware to check if the user is the owner of the board.
 * @param {function} boardController.exportBoardJson - Controller function to export board as JSON.
 */
router.get(
    '/boards/:id/export/json',
    authenticateUser,
    getBoardMiddleware,
    isOwner,
    boardController.exportBoardJson
);

/**
 * Route for exporting board data as CSV.
 * @name GET /boards/:id/export/csv
 * @function
 * @memberof module:routes/boards
 * @param {function} authenticateUser - Middleware to authenticate the user.
 * @param {function} getBoardMiddleware - Middleware to fetch the board and attach to request.
 * @param {function} isOwner - Middleware to check if the user is the owner of the board.
 * @param {function} boardController.exportBoardCsv - Controller function to export board as CSV.
 */
router.get(
    '/boards/:id/export/csv',
    authenticateUser,
    getBoardMiddleware,
    isOwner,
    boardController.exportBoardCsv
);

/**
 * Route for importing board data from JSON.
 * @name POST /boards/import/json
 * @function
 * @memberof module:routes/boards
 * @param {function} authenticateUser - Middleware to authenticate the user.
 * @param {function} boardController.importBoardJson - Controller function to import board from JSON.
 */
router.post('/boards/import/json', authenticateUser, boardController.importBoardJson);

module.exports = router;
