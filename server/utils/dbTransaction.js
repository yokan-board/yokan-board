/**
 * @file Utility for managing database transactions.
 * @module utils/dbTransaction
 */

const db = require('../database');

/**
 * Executes a database operation within a transaction.
 * Automatically handles BEGIN, COMMIT, and ROLLBACK.
 * @param {function(): Promise<any>} callback - An async function containing the database operations to be run within the transaction.
 * @returns {Promise<any>} A promise that resolves with the result of the callback function, or rejects if an error occurs.
 */
const runTransaction = (callback) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION;');
            callback()
                .then((result) => {
                    db.run('COMMIT;', (err) => {
                        if (err) {
                            db.run('ROLLBACK;');
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
                })
                .catch((err) => {
                    db.run('ROLLBACK;');
                    reject(err);
                });
        });
    });
};

module.exports = { runTransaction };
