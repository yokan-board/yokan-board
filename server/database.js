const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const DBSOURCE = process.env.DB_FILE || 'db.sqlite';

const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        // Cannot open database
        console.error(err.message);
        throw err;
    } else {
        if (process.env.NODE_ENV !== 'test') {
            console.log('Connected to the SQLite database.');
        }
        db.run(
            `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            email TEXT UNIQUE,
            display_name TEXT,
            preferences TEXT DEFAULT '{}'
        )`,
            (err) => {
                if (err) {
                    console.error('Error creating users table (might already exist):', err.message);
                } else {
                    console.log('Users table created or already exists.');
                }

                // Check and add columns if they don't exist for backward compatibility
                db.all('PRAGMA table_info(users)', (errPragma, rows) => {
                    if (errPragma) {
                        console.error('Error checking table info:', errPragma.message);
                        return;
                    }
                    const columns = rows.map((col) => col.name);

                    if (!columns.includes('email')) {
                        db.run(`ALTER TABLE users ADD COLUMN email TEXT`, (errAlter) => {
                            if (errAlter) {
                                console.error('Error adding email column:', errAlter.message);
                            } else {
                                console.log('Added email column to users table.');
                            }
                        });
                    }

                    if (!columns.includes('display_name')) {
                        db.run(`ALTER TABLE users ADD COLUMN display_name TEXT`, (errAlter) => {
                            if (errAlter) {
                                console.error(
                                    'Error adding display_name column:',
                                    errAlter.message
                                );
                            } else {
                                console.log('Added display_name column to users table.');
                            }
                        });
                    }

                    if (!columns.includes('preferences')) {
                        db.run(
                            `ALTER TABLE users ADD COLUMN preferences TEXT DEFAULT '{}'`,
                            (errAlter) => {
                                if (errAlter) {
                                    console.error(
                                        'Error adding preferences column:',
                                        errAlter.message
                                    );
                                } else {
                                    console.log('Added preferences column to users table.');
                                }
                            }
                        );
                    }
                });

                db.run(
                    `CREATE TABLE IF NOT EXISTS boards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                name TEXT,
                data TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )`,
                    (err) => {
                        if (err) {
                            console.error('Error creating boards table:', err.message);
                            return;
                        }

                        const INITIAL_USER_ID = process.env.INITIAL_USER_ID || 'user';
                        const INITIAL_USER_PASSWORD = process.env.INITIAL_USER_PASSWORD || 'password';
                        const INITIAL_USER_EMAIL = process.env.INITIAL_USER_EMAIL || 'yokan.board@gmail.com';

                        db.get(
                            `SELECT COUNT(*) as count FROM users WHERE username = ?`,
                            [INITIAL_USER_ID],
                            (err, row) => {
                                if (err) {
                                    console.error('Error checking for initial user:', err.message);
                                    return;
                                }
                                if (row.count === 0) {
                                    // No initial user found, create one
                                    console.log(
                                        `Attempting to create initial user '${INITIAL_USER_ID}' with password '${INITIAL_USER_PASSWORD}'`
                                    );
                                    const hashedPassword = bcrypt.hashSync(
                                        INITIAL_USER_PASSWORD,
                                        10
                                    );
                                    console.log(
                                        `Hashed password for initial user: ${hashedPassword}`
                                    );
                                    db.run(
                                        `INSERT INTO users (username, password, email) VALUES (?, ?, ?)`,
                                        [INITIAL_USER_ID, hashedPassword, INITIAL_USER_EMAIL],
                                        function (err) {
                                            if (err) {
                                                console.error(
                                                    'Error creating initial user:',
                                                    err.message
                                                );
                                            } else {
                                                console.log(
                                                    `Initial user '${INITIAL_USER_ID}' created with ID: ${this.lastID}`
                                                );
                                            }
                                        }
                                    );
                                } else {
                                    console.log(
                                        `Initial user '${INITIAL_USER_ID}' already exists.`
                                    );
                                }
                            }
                        );
                    }
                );
            }
        );
    }
});

module.exports = db;
