/**
 * @file Controller for handling board-related requests (CRUD, export).
 * @module controllers/boardController
 */

const boardModel = require('../models/board');
const { BadRequestError, ForbiddenError, NotFoundError, AppError } = require('../utils/appError');

/**
 * Retrieves all boards for a specific user.
 * @param {object} req - The Express request object, expected to have `req.params.id` (user ID) and `req.user_id`.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
exports.getAllBoardsForUser = async (req, res, next) => {
    const { id } = req.params;
    if (Number(id) !== Number(req.user.id)) {
        return next(new ForbiddenError('Unauthorized: User ID mismatch'));
    }
    try {
        const boards = await boardModel.getAllBoardsByUserId(id);
        res.json({
            message: 'success',
            data: boards,
        });
    } catch (err) {
        next(new AppError(err.message, 400)); // Use AppError for generic errors
    }
};

/**
 * Retrieves a single board by its ID.
 * @param {object} req - The Express request object, expected to have `req.params.id` (board ID).
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
exports.getBoardById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const board = await boardModel.getBoardById(id);
        if (!board) {
            return next(new NotFoundError('Board not found'));
        }
        res.json({
            message: 'success',
            data: board,
        });
    } catch (err) {
        next(new AppError(err.message, 400)); // Use AppError for generic errors
    }
};

/**
 * Creates a new board.
 * @param {object} req - The Express request object, expected to have `req.body.user_id`, `req.body.name`, and `req.body.data`.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
exports.createBoard = async (req, res, next) => {
    const { user_id, name } = req.body;
    const providedData = req.body.data || {};

    if (!user_id || !name) {
        return next(new BadRequestError('User ID and board name are required'));
    }

    const defaultData = {
        columns: {},
        columnOrder: [],
        description: '',
        gradientColors: [],
    };

    const data = { ...defaultData, ...providedData };

    if (providedData.columns && !providedData.columnOrder) {
        data.columnOrder = Object.keys(providedData.columns);
    }

    try {
        const newBoard = await boardModel.createBoard(user_id, name, data);
        res.status(201).json({
            message: 'success',
            data: newBoard,
        });
    } catch (err) {
        next(new AppError(err.message, 400));
    }
};

/**
 * Updates an existing board.
 * @param {object} req - The Express request object, expected to have `req.params.id` (board ID), `req.body.name`, and `req.body.data`.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
exports.updateBoard = async (req, res, next) => {
    const { id } = req.params;
    const { name, data } = req.body;

    try {
        const updatedBoard = await boardModel.updateBoard(id, name, data);
        res.json({
            message: 'success',
            data: {
                id: Number(id),
            },
            changes: updatedBoard.changes,
        });
    } catch (err) {
        next(new AppError(err.message, 400)); // Use AppError for generic errors
    }
};

/**
 * Deletes a board.
 * @param {object} req - The Express request object, expected to have `req.params.id` (board ID).
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
exports.deleteBoard = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await boardModel.deleteBoard(id);
        res.json({ message: 'deleted', changes: result.changes });
    } catch (err) {
        next(new AppError(err.message, 400)); // Use AppError for generic errors
    }
};

/**
 * Exports a board's data as a JSON file.
 * @param {object} req - The Express request object, expected to have `req.params.id` (board ID) and `req.user.id`.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
exports.exportBoardJson = async (req, res, next) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        const row = await boardModel.getBoardForExport(id, user_id);
        if (!row) {
            return next(new NotFoundError('Board not found or unauthorized'));
        }

        const boardData = {
            id: Number(id),
            name: row.name,
            data:
                typeof row.data === 'string' && row.data !== '[object Object]'
                    ? JSON.parse(row.data)
                    : { columns: {} },
        };

        const filename = `${boardData.name.replace(/[^a-z0-9]/gi, '_')}-export-${new Date().toISOString().slice(0, 10)}.json`;

        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(boardData, null, 2));
    } catch (err) {
        next(new AppError(err.message, 400)); // Use AppError for generic errors
    }
};

/**
 * Exports a board's data as a CSV file.
 * @param {object} req - The Express request object, expected to have `req.params.id` (board ID) and `req.user.id`.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
exports.exportBoardCsv = async (req, res, next) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        const row = await boardModel.getBoardForExport(id, user_id);
        if (!row) {
            return next(new NotFoundError('Board not found or unauthorized'));
        }

        const boardName = row.name;
        const boardContent =
            typeof row.data === 'string' && row.data !== '[object Object]'
                ? JSON.parse(row.data)
                : { columns: {} };

        let csvRows = [];
        const headers = [
            'Task ID',
            'Task Content',
            'Description',
            'Due Date',
            'Column Name',
            'Parent Task ID',
        ];
        csvRows.push(headers.join(','));

        const allTasks = [];
        if (boardContent.columns) {
            for (const columnId in boardContent.columns) {
                const column = boardContent.columns[columnId];
                if (column && column.tasks) {
                    column.tasks.forEach((task) => {
                        allTasks.push({
                            ...task,
                            columnName: column.title || '',
                            description: task.description || '',
                            dueDate: task.dueDate || null,
                        });
                    });
                }
            }
        }

        allTasks.sort((a, b) => {
            if (a.parentId === b.id) return 1;
            if (b.parentId === a.id) return -1;
            return 0;
        });

        allTasks.forEach((task) => {
            const taskId = `"${(task.id || '').replace(/"/g, '""')}"`;
            const taskContent = `"${(task.content || '').replace(/"/g, '""')}"`;
            const description = `"${(task.description || '').replace(/"/g, '""')}"`;
            const dueDate = task.dueDate
                ? `"${new Date(task.dueDate).toISOString().slice(0, 10)}"` // Format to YYYY-MM-DD
                : '""';
            const columnName = `"${(task.columnName || '').replace(/"/g, '""')}"`;
            const parentTaskId = `"${(task.parentId || '').replace(/"/g, '""')}"`;
            csvRows.push(
                [taskId, taskContent, description, dueDate, columnName, parentTaskId].join(',')
            );
        });

        const filename = `${boardName.replace(/[^a-z0-9]/gi, '_')}-export-${new Date().toISOString().slice(0, 10)}.csv`;

        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'text/csv');
        res.send(csvRows.join('\n'));
    } catch (err) {
        next(new AppError(err.message, 400)); // Use AppError for generic errors
    }
};

/**
 * Imports a board from a JSON file.
 * @param {object} req - The Express request object, expected to have `req.body` containing the board data and `req.user.id`.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
exports.importBoardJson = async (req, res, next) => {
    const { name, data } = req.body;
    const user_id = req.user.id;

    if (!name || !data) {
        return next(new BadRequestError('Board name and data are required for import'));
    }

    try {
        const newBoard = await boardModel.importBoard(user_id, name, data);
        res.status(201).json({
            message: 'success',
            data: newBoard,
        });
    } catch (err) {
        next(new AppError(err.message, 400));
    }
};
