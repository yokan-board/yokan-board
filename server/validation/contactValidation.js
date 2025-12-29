const { body, param, query } = require('express-validator');

exports.validateContact = [
    body('name')
        .isString()
        .withMessage('Name must be a string')
        .notEmpty()
        .withMessage('Name is required'),
    body('title').optional({ checkFalsy: true }).isString().withMessage('Title must be a string'),
    body('company')
        .optional({ checkFalsy: true })
        .isString()
        .withMessage('Company must be a string'),
    body('email').isEmail().withMessage('Must be a valid email'),
    body('phone').optional({ checkFalsy: true }).isString().withMessage('Phone must be a string'),
    body('avatarUrl')
        .optional({ checkFalsy: true })
        .isURL()
        .withMessage('Avatar URL must be a valid URL'),
    body('status')
        .optional({ checkFalsy: true })
        .isIn(['ACTIVE', 'INACTIVE'])
        .withMessage('Invalid status'),
];

exports.validateContactId = [
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
];

exports.validateSearchQuery = [query('q').isString().withMessage('Search query must be a string')];
