/**
 * @file Defines authentication routes for user signup and login.
 * @module routes/auth
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { signupValidation, loginValidation } = require('../validation/authValidation');
const { validate } = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Route for user signup.
 * @name POST /signup
 * @function
 * @memberof module:routes/auth
 * @param {Array<function>} signupValidation - Middleware for validating signup input.
 * @param {function} validate - Middleware for handling validation results.
 * @param {function} authController.signup - Controller function to handle user signup.
 */
router.post('/signup', signupValidation, validate, authController.signup);

/**
 * Route for user login.
 * @name POST /login
 * @function
 * @memberof module:routes/auth
 * @param {Array<function>} loginValidation - Middleware for validating login input.
 * @param {function} validate - Middleware for handling validation results.
 * @param {function} authController.login - Controller function to handle user login.
 */
router.post('/login', loginValidation, validate, authController.login);

/**
 * Route for refreshing a JWT.
 * @name POST /refresh-token
 * @function
 * @memberof module:routes/auth
 * @param {function} authMiddleware - Middleware to verify the existing token.
 * @param {function} authController.refreshToken - Controller function to issue a new token.
 */
router.post('/refresh-token', authMiddleware, authController.refreshToken);

module.exports = router;
