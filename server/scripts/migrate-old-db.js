const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const OLD_DB_PATH = path.join(__dirname, '..', 'old-db.sqlite');
const NEW_DB_PATH = path.join(__dirname, '..', 'new-db.sqlite');

if (!fs.existsSync(OLD_DB_PATH)) {
    console.error(`Old database not found at ${OLD_DB_PATH}`);
    process.exit(1);
}

if (fs.existsSync(NEW_DB_PATH)) {
    console.log(`Removing existing ${NEW_DB_PATH}`);
    fs.unlinkSync(NEW_DB_PATH);
}

const oldDb = new sqlite3.Database(OLD_DB_PATH);
const newDb = new sqlite3.Database(NEW_DB_PATH);

const run = (db, sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this);
    });
});

const get = (db, sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
    });
});

const all = (db, sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
    });
});

async function migrate() {
    console.log('Starting migration...');

    try {
        // 1. Create Schema in new DB
        console.log('Creating schema in new database...');
        await run(newDb, `CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            email TEXT UNIQUE,
            display_name TEXT,
            preferences TEXT DEFAULT '{}',
            enabled INTEGER DEFAULT 0,
            last_login DATETIME
        )`);

        await run(newDb, `CREATE TABLE boards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT,
            data TEXT,
            collection TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`);

        await run(newDb, `CREATE TABLE contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            title TEXT,
            company TEXT,
            email TEXT,
            phone TEXT,
            avatarUrl TEXT,
            status TEXT DEFAULT 'ACTIVE',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id, email)
        )`);

        // 2. Migrate Users
        console.log('Migrating users...');
        const users = await all(oldDb, `SELECT * FROM users`);
        for (const user of users) {
            const columns = Object.keys(user).join(', ');
            const placeholders = Object.keys(user).map(() => '?').join(', ');
            const values = Object.values(user);
            await run(newDb, `INSERT INTO users (${columns}) VALUES (${placeholders})`, values);
        }
        console.log(`Migrated ${users.length} users.`);

        // 3. Migrate Boards and Contacts
        console.log('Migrating boards and contacts...');
        const boards = await all(oldDb, `SELECT * FROM boards`);
        
        // Map to keep track of contact IDs to avoid duplicates (user_id -> email -> new_id)
        const contactMap = new Map();

        for (const board of boards) {
            console.log(`Processing board: ${board.name} (ID: ${board.id})`);
            
            let boardData = {};
            try {
                boardData = JSON.parse(board.data);
            } catch (e) {
                console.warn(`Failed to parse data for board ${board.id}`);
            }

            const contactIds = [];

            if (boardData.contacts && Array.isArray(boardData.contacts)) {
                for (const contact of boardData.contacts) {
                    if (!contact.email) {
                        console.warn(`Contact ${contact.name} in board ${board.id} has no email, skipping.`);
                        continue;
                    }

                    const userKey = board.user_id;
                    if (!contactMap.has(userKey)) {
                        contactMap.set(userKey, new Map());
                    }
                    const userContacts = contactMap.get(userKey);

                    if (userContacts.has(contact.email)) {
                        // Already migrated this contact for this user
                        contactIds.push(userContacts.get(contact.email));
                    } else {
                        // Insert new contact
                        try {
                            const result = await run(newDb, 
                                `INSERT INTO contacts (user_id, name, title, company, email, phone, avatarUrl, status) 
                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                                [
                                    board.user_id,
                                    contact.name,
                                    contact.title || null,
                                    contact.company || null,
                                    contact.email,
                                    contact.phone || null,
                                    contact.avatarUrl || null,
                                    contact.status || 'ACTIVE'
                                ]
                            );
                            const newContactId = result.lastID;
                            userContacts.set(contact.email, newContactId);
                            contactIds.push(newContactId);
                        } catch (err) {
                            if (err.message.includes('UNIQUE constraint failed')) {
                                // Fallback: try to find it (shouldn't happen with our Map logic but safer)
                                const existing = await get(newDb, `SELECT id FROM contacts WHERE user_id = ? AND email = ?`, [board.user_id, contact.email]);
                                if (existing) {
                                    userContacts.set(contact.email, existing.id);
                                    contactIds.push(existing.id);
                                }
                            } else {
                                console.error(`Error migrating contact ${contact.email}:`, err.message);
                            }
                        }
                    }
                }
            }

            // Update board data
            delete boardData.contacts;
            boardData.contactIds = contactIds;
            board.data = JSON.stringify(boardData);

            // Insert board
            const columns = Object.keys(board).join(', ');
            const placeholders = Object.keys(board).map(() => '?').join(', ');
            const values = Object.values(board);
            await run(newDb, `INSERT INTO boards (${columns}) VALUES (${placeholders})`, values);
        }
        console.log(`Migrated ${boards.length} boards.`);

        console.log('Migration successfully completed!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        oldDb.close();
        newDb.close();
    }
}

migrate();
