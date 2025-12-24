const db = require('../database');

/**
 * Creates a new contact.
 * @param {object} contactData - The contact data { user_id, name, title, company, email, phone, avatarUrl, status }.
 * @returns {Promise<object>} The newly created contact.
 */
exports.createContact = (contactData) => {
    const { user_id, name, title, company, email, phone, avatarUrl, status } = contactData;
    const sql = `INSERT INTO contacts (user_id, name, title, company, email, phone, avatarUrl, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [user_id, name, title, company, email, phone, avatarUrl, status || 'ACTIVE'];

    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, ...contactData });
            }
        });
    });
};

/**
 * Retrieves all contacts for a user.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<Array<object>>} A list of contacts.
 */
exports.getAllContactsByUserId = (userId) => {
    const sql = `SELECT * FROM contacts WHERE user_id = ? ORDER BY name ASC`;
    return new Promise((resolve, reject) => {
        db.all(sql, [userId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

/**
 * Finds a contact by its ID.
 * @param {number} contactId - The ID of the contact.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<object|null>} The contact object or null if not found.
 */
exports.getContactById = (contactId, userId) => {
    const sql = `SELECT * FROM contacts WHERE id = ? AND user_id = ?`;
    return new Promise((resolve, reject) => {
        db.get(sql, [contactId, userId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

/**
 * Updates an existing contact.
 * @param {number} contactId - The ID of the contact to update.
 * @param {number} userId - The ID of the user.
 * @param {object} contactData - The contact data to update.
 * @returns {Promise<object>} The result of the update operation.
 */
exports.updateContact = (contactId, userId, contactData) => {
    const { name, title, company, email, phone, avatarUrl, status } = contactData;
    const sql = `UPDATE contacts SET name = ?, title = ?, company = ?, email = ?, phone = ?, avatarUrl = ?, status = ? WHERE id = ? AND user_id = ?`;
    const params = [name, title, company, email, phone, avatarUrl, status, contactId, userId];

    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ changes: this.changes });
            }
        });
    });
};

/**
 * Deletes a contact by its ID.
 * @param {number} contactId - The ID of the contact to delete.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<object>} The result of the delete operation.
 */
exports.deleteContact = (contactId, userId) => {
    const sql = `DELETE FROM contacts WHERE id = ? AND user_id = ?`;
    return new Promise((resolve, reject) => {
        db.run(sql, [contactId, userId], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ changes: this.changes });
            }
        });
    });
};

/**
 * Checks how many boards reference a specific contact.
 * @param {number} contactId - The ID of the contact.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<number>} The number of boards referencing the contact.
 */
exports.getContactUsageCount = (contactId, userId) => {
    // We use json_each to search inside the contactIds array in the board's data blob
    const sql = `
        SELECT COUNT(DISTINCT boards.id) as count 
        FROM boards, json_each(boards.data, '$.contactIds') 
        WHERE boards.user_id = ? AND json_each.value = ?
    `;
    return new Promise((resolve, reject) => {
        db.get(sql, [userId, contactId], (err, row) => {
            if (err) {
                // If data is not valid JSON or contactIds doesn't exist, it might throw. 
                // In that case, we fallback to 0.
                resolve(0);
            } else {
                resolve(row.count || 0);
            }
        });
    });
};

/**
 * Searches for contacts by a query string (name or email).
 * @param {number} userId - The ID of the user.
 * @param {string} query - The search query.
 * @returns {Promise<Array<object>>} A list of matching contacts.
 */
exports.searchContacts = (userId, query) => {
    const sql = `SELECT * FROM contacts WHERE user_id = ? AND (name LIKE ? OR email LIKE ?)`;
    const params = [userId, `%${query}%`, `%${query}%`];
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};
