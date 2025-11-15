/**
 * @file Model for interacting with the 'boards' table in the database.
 * @module models/board
 */

const db = require('../database');
const { runTransaction } = require('../utils/dbTransaction');

/**
 * Retrieves all boards associated with a specific user ID.
 * Parses the 'data' field from JSON string to object.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<Array<object>>} A promise that resolves with an array of board objects.
 */
exports.getAllBoardsByUserId = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'select * from boards where user_id = ?';
        db.all(sql, [userId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(
                    rows.map((row) => ({
                        ...row,
                        data:
                            typeof row.data === 'string' && row.data !== '[object Object]'
                                ? JSON.parse(row.data)
                                : { columns: {} },
                    }))
                );
            }
        });
    });
};

/**
 * Retrieves a single board by its ID.
 * Parses the 'data' field from JSON string to object.
 * @param {number} id - The ID of the board.
 * @returns {Promise<object|undefined>} A promise that resolves with the board object if found, otherwise undefined.
 */
exports.getBoardById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'select * from boards where id = ?';
        db.get(sql, [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(
                    row
                        ? {
                              ...row,
                              data:
                                  typeof row.data === 'string' && row.data !== '[object Object]'
                                      ? JSON.parse(row.data)
                                      : { columns: {} },
                          }
                        : row
                );
            }
        });
    });
};

/**
 * Creates a new board in the database.
 * @param {number} user_id - The ID of the user who owns the board.
 * @param {string} name - The name of the board.
 * @param {object} data - The JSON data structure of the board (e.g., columns, tasks).
 * @param {string} [collection] - The optional collection name for the board.
 * @returns {Promise<object>} A promise that resolves with the ID of the newly created board.
 */
exports.createBoard = (user_id, name, data, collection) => {
    return new Promise((resolve, reject) => {
        const insert = 'INSERT INTO boards (user_id, name, data, collection) VALUES (?,?,?,?)';
        db.run(insert, [user_id, name, JSON.stringify(data), collection], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID });
            }
        });
    });
};

/**
 * Updates an existing board in the database.
 * @param {number} id - The ID of the board to update.
 * @param {string} name - The new name of the board.
 * @param {object} data - The new JSON data structure of the board.
 * @param {string} [collection] - The optional new collection name for the board.
 * @returns {Promise<object>} A promise that resolves with the updated board's ID and the number of changes made.
 */
exports.updateBoard = (id, name, data, collection) => {
    return new Promise((resolve, reject) => {
        const update = `UPDATE boards set 
           name = COALESCE(?,name), 
           data = COALESCE(?,data),
           collection = COALESCE(?,collection)
           WHERE id = ?`;
        db.run(update, [name, JSON.stringify(data), collection, id], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: Number(id), changes: this.changes });
            }
        });
    });
};

/**
 * Deletes a board from the database.
 * @param {number} id - The ID of the board to delete.
 * @returns {Promise<object>} A promise that resolves with a message and the number of changes made.
 */
exports.deleteBoard = (id) => {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM boards WHERE id = ?', id, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ message: 'deleted', changes: this.changes });
            }
        });
    });
};

/**
 * Retrieves board name and data for export purposes.
 * @param {number} id - The ID of the board.
 * @param {number} user_id - The ID of the user requesting the export.
 * @returns {Promise<object|undefined>} A promise that resolves with the board's name and data if found and authorized, otherwise undefined.
 */
exports.getBoardForExport = (id, user_id) => {
    return new Promise((resolve, reject) => {
        const sql = 'select name, data from boards where id = ? AND user_id = ?';
        db.get(sql, [id, user_id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

/**
 * Imports a new board into the database within a transaction.
 * @param {number} user_id - The ID of the user importing the board.
 * @param {string} name - The name of the imported board.
 * @param {object} data - The JSON data structure of the imported board.
 * @returns {Promise<object>} A promise that resolves with the ID, name, and data of the newly imported board.
 */
exports.importBoard = (user_id, name, data) => {
    return runTransaction(async () => {
        const insertBoardSql = 'INSERT INTO boards (user_id, name, data) VALUES (?,?,?)';
        const newBoardId = await new Promise((resolve, reject) => {
            db.run(insertBoardSql, [user_id, name, JSON.stringify(data)], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
        return {
            id: newBoardId,
            name: name,
            data: data,
        };
    });
};
