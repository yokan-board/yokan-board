/**
 * @file Defines validation rules for user account management requests.
 * @module validation/userValidation
 */

const { check } = require('express-validator');

/**
 * Validation rules for updating a user's profile.
 * Checks for:
 * - `display_name`: optional, must not be empty.
 * - `email`: optional, must be a valid email format.
 * @type {Array<object>}
 */
exports.updateProfileValidation = [
    check('display_name', 'Display name must not be empty').optional().not().isEmpty(),
    check('email', 'Please include a valid email').optional().isEmail(),
];

/**
 * Validation rules for changing a user's password.
 * Checks for:
 * - `currentPassword`: required.
 * - `newPassword`: required, minimum 6 characters.
 * @type {Array<object>}
 */
exports.updatePasswordValidation = [
    check('currentPassword', 'Current password is required').not().isEmpty(),
    check('newPassword', 'New password must be at least 6 characters long').isLength({ min: 6 }),
];
