/**
 * @file Model for interacting with the 'users' table in the database.
 * @module models/user
 */

const db = require('../database');

/**
 * Creates a new user in the database.
 * @param {string} username - The username of the new user.
 * @param {string} hashedPassword - The hashed password of the new user.
 * @param {string} email - The email of the new user.
 * @returns {Promise<object>} A promise that resolves with the new user's ID, username, and email.
 */
exports.createUser = (username, hashedPassword, email) => {
    return new Promise((resolve, reject) => {
        const insert = 'INSERT INTO users (username, password, email) VALUES (?,?,?)';
        db.run(insert, [username, hashedPassword, email], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, username, email });
            }
        });
    });
};

/**
 * Finds a user by their username.
 * @param {string} username - The username to search for.
 * @returns {Promise<object|undefined>} A promise that resolves with the user object if found, otherwise undefined.
 */
exports.findUserByUsername = (username) => {
    return new Promise((resolve, reject) => {
        const sql = 'select * from users where username = ?';
        db.get(sql, [username], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

/**
 * Finds a user by their ID.
 * @param {number} id - The ID of the user to find.
 * @returns {Promise<object|undefined>} A promise that resolves with the user object if found, otherwise undefined.
 */
exports.findUserById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE id = ?';
        db.get(sql, [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

/**
 * Finds a user by their email.
 * @param {string} email - The email to search for.
 * @returns {Promise<object|undefined>} A promise that resolves with the user object if found, otherwise undefined.
 */
exports.findUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE email = ?';
        db.get(sql, [email], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

/**
 * Updates a user's data in the database.
 * @param {number} userId - The ID of the user to update.
 * @param {object} userData - An object containing the user data to update (e.g., { email, display_name }).
 * @returns {Promise<number>} A promise that resolves with the number of rows changed.
 */
exports.updateUser = (userId, userData) => {
    return new Promise((resolve, reject) => {
        const fields = Object.keys(userData);
        const values = Object.values(userData);

        if (fields.length === 0) {
            return resolve(0); // Nothing to update
        }

        const setClause = fields.map((field) => `${field} = ?`).join(', ');
        const sql = `UPDATE users SET ${setClause} WHERE id = ?`;

        db.run(sql, [...values, userId], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
};
