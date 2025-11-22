/**
 * @file Defines API routes for user account management.
 * @module routes/user
 */

const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const {
    updateProfileValidation,
    updatePasswordValidation,
} = require('../validation/userValidation');
const { validate } = require('../middleware/validationMiddleware');
const { isAdmin } = require('../middleware/authorizationMiddleware');

/**
 * Route for getting the current user's profile.
 * @name GET /user/profile
 * @function
 * @memberof module:routes/user
 * @param {function} authenticateUser - Middleware to authenticate the user.
 * @param {function} userController.getUserProfile - Controller function to get user profile.
 */
router.get('/user/profile', authenticateUser, userController.getUserProfile);

/**
 * Route for updating the current user's profile.
 * @name PUT /user/profile
 * @function
 * @memberof module:routes/user
 */
router.put(
    '/user/profile',
    authenticateUser,
    updateProfileValidation,
    validate,
    userController.updateUserProfile
);

/**
 * Route for updating the current user's password.
 * @name PUT /user/password
 * @function
 * @memberof module:routes/user
 */
router.put(
    '/user/password',
    authenticateUser,
    updatePasswordValidation,
    validate,
    userController.updatePassword
);

/**
 * Route for getting the current user's preferences.
 * @name GET /user/preferences
 * @function
 * @memberof module:routes/user
 */
router.get('/user/preferences', authenticateUser, userController.getPreferences);

/**
 * Route for updating the current user's preferences.
 * @name PUT /user/preferences
 * @function
 * @memberof module:routes/user
 */
router.put('/user/preferences', authenticateUser, userController.updatePreferences);

/**
 * Route for getting all users (Admin only).
 * @name GET /users
 * @function
 * @memberof module:routes/user
 * @param {function} authenticateUser - Middleware to authenticate the user.
 * @param {function} isAdmin - Middleware to check if the user is an administrator.
 * @param {function} userController.getAllUsers - Controller function to get all users.
 */
/**
 * Route for getting all users (Admin only).
 * @name GET /users
 * @function
 * @memberof module:routes/user
 * @param {function} authenticateUser - Middleware to authenticate the user.
 * @param {function} isAdmin - Middleware to check if the user is an administrator.
 * @param {function} userController.getAllUsers - Controller function to get all users.
 */
router.get('/users', authenticateUser, isAdmin, userController.getAllUsers);

/**
 * Route for updating a user's enabled status (Admin only).
 * @name PUT /users/:id/enabled
 * @function
 * @memberof module:routes/user
 * @param {function} authenticateUser - Middleware to authenticate the user.
 * @param {function} isAdmin - Middleware to check if the user is an administrator.
 * @param {function} userController.updateUserEnabledStatus - Controller function to update user enabled status.
 */
router.put('/users/:id/enabled', authenticateUser, isAdmin, userController.updateUserEnabledStatus);

module.exports = router;
