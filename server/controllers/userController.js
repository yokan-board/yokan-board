/**
 * @file Controller for handling user account management requests.
 * @module controllers/userController
 */

const userModel = require('../models/user');
const bcrypt = require('bcrypt');
const { AppError, BadRequestError, UnauthorizedError } = require('../utils/appError');

// Simplified merge for preferences, as they are expected to be a flat object
function mergePreferences(existing, newPrefs) {
    return { ...existing, ...newPrefs };
}

/**
 * Retrieves the public profile of the currently authenticated user.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
exports.getUserProfile = async (req, res, next /* eslint-disable-line no-unused-vars */) => {
    // The user object is attached to the request by the authenticateUser middleware
    const { id, username, display_name, email } = req.user;

    res.status(200).json({
        id,
        username,
        display_name,
        email,
    });
};

/**
 * Updates the profile of the currently authenticated user.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
exports.updateUserProfile = async (req, res, next /* eslint-disable-line no-unused-vars */) => {
    const userId = req.user.id;
    const { display_name, email } = req.body;

    try {
        // If email is being updated, check if it's already taken by another user
        if (email && email !== req.user.email) {
            const existingUser = await userModel.findUserByEmail(email);
            if (existingUser && existingUser.id !== userId) {
                return next(new BadRequestError('Email is already in use.'));
            }
        }

        const updateData = {};
        if (display_name !== undefined) updateData.display_name = display_name;
        if (email !== undefined) updateData.email = email;

        if (Object.keys(updateData).length === 0) {
            const { id, username, display_name, email } = req.user;
            return res.status(200).json({ id, username, display_name, email }); // Nothing to update, return current profile
        }

        await userModel.updateUser(userId, updateData);

        const updatedUser = await userModel.findUserById(userId);

        res.status(200).json({
            id: updatedUser.id,
            username: updatedUser.username,
            display_name: updatedUser.display_name,
            email: updatedUser.email,
        });
    } catch (err) {
        next(new AppError(err.message, 400));
    }
};

/**
 * Updates the password of the currently authenticated user.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
exports.updatePassword = async (req, res, next /* eslint-disable-line no-unused-vars */) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    try {
        // Verify the current password against the user object from the auth middleware
        const isMatch = await bcrypt.compare(currentPassword, req.user.password);
        if (!isMatch) {
            return next(new UnauthorizedError('Incorrect current password.'));
        }

        // Hash the new password
        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        // Update the user's password
        await userModel.updateUser(userId, { password: hashedPassword });

        res.status(200).json({ message: 'Password updated successfully.' });
    } catch (err) {
        next(new AppError(err.message, 400));
    }
};

/**
 * Retrieves the preferences of the currently authenticated user.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
exports.getPreferences = async (req, res, next /* eslint-disable-line no-unused-vars */) => {
    try {
        const preferences = req.user.preferences ? JSON.parse(req.user.preferences) : {};
        // Ensure default value for hideUnnamedCollectionHeading
        if (typeof preferences.hideUnnamedCollectionHeading === 'undefined') {
            preferences.hideUnnamedCollectionHeading = false;
        }
        res.status(200).json(preferences);
    } catch (err) {
        next(new AppError(err.message, 400));
    }
};

/**
 * Updates the preferences of the currently authenticated user.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
exports.updatePreferences = async (req, res, next /* eslint-disable-line no-unused-vars */) => {
    const userId = req.user.id;
    const newPreferences = req.body;

    try {
        const existingPreferences = req.user.preferences ? JSON.parse(req.user.preferences) : {};

        const mergedPreferences = mergePreferences(existingPreferences, newPreferences);

        await userModel.updateUser(userId, { preferences: JSON.stringify(mergedPreferences) });

        res.status(200).json(mergedPreferences);
    } catch (err) {
        next(new AppError(err.message, 400));
    }
};
