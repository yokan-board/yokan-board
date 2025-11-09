/**
 * @file Defines validation rules for authentication-related requests using express-validator.
 * @module validation/authValidation
 */

const { check } = require('express-validator');

/**
 * Validation rules for user signup.
 * Checks for:
 * - `username`: required, minimum 3 characters.
 * - `password`: required, minimum 6 characters.
 * - `email`: required, valid email format.
 * @type {Array<object>}
 */
exports.signupValidation = [
    check('username', 'Username is required').not().isEmpty(),
    check('username', 'Username must be at least 3 characters long').isLength({ min: 3 }),
    check('password', 'Password is required').not().isEmpty(),
    check('password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
    check('email', 'Email is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
];

/**
 * Validation rules for user login.
 * Checks for:
 * - `username`: required.
 * - `password`: required.
 * @type {Array<object>}
 */
exports.loginValidation = [
    check('username', 'Username is required').not().isEmpty(),
    check('password', 'Password is required').not().isEmpty(),
];
