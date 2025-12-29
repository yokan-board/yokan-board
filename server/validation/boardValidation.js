/**
 * @file Defines validation rules for board-related requests using express-validator.
 * @module validation/boardValidation
 */

const { check } = require('express-validator');

/**
 * Validation rules for creating a new board.
 * Checks for:
 * - `user_id`: required, must be an integer.
 * - `name`: required, must not be empty.
 * @type {Array<object>}
 */
exports.createBoardValidation = [
    check('user_id', 'User ID is required').not().isEmpty().isInt(),
    check('name', 'Board name is required').not().isEmpty(),
    check('collection', 'Collection name must be a string').optional().isString(),
    check('data.org').optional().isObject().withMessage('org must be an object'),
    check('data.org.short_name').optional().isString().withMessage('short_name must be a string'),
    check('data.org.full_name').optional().isString().withMessage('full_name must be a string'),
    check('data.org.logo')
        .optional()
        .isString()
        .withMessage('logo must be a string (URL or Base64)'),
    check('data.org.url')
        .optional({ checkFalsy: true })
        .isURL()
        .withMessage('url must be a valid URL'),
];

/**
 * Validation rules for updating an existing board.
 * Checks for:
 * - `name`: optional, must not be empty if present.
 * - `data`: optional, must be a valid JSON object if present.
 * - `collection`: optional, must be a string and not empty if present.
 * @type {Array<object>}
 */
exports.updateBoardValidation = [
    check('name', 'Board name must not be empty').optional().not().isEmpty(),
    // Removed isJSON() check as data is expected to be an object, not a JSON string
    check('data', 'Board data must be a valid object').optional(),
    check('collection', 'Collection name must be a string').optional().isString(),
    check('data.org').optional().isObject().withMessage('org must be an object'),
    check('data.org.short_name').optional().isString().withMessage('short_name must be a string'),
    check('data.org.full_name').optional().isString().withMessage('full_name must be a string'),
    check('data.org.logo')
        .optional()
        .isString()
        .withMessage('logo must be a string (URL or Base64)'),
    check('data.org.url')
        .optional({ checkFalsy: true })
        .isURL()
        .withMessage('url must be a valid URL'),
];
