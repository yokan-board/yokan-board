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
            preferences TEXT DEFAULT '{}',
            enabled INTEGER DEFAULT 0,
            last_login DATETIME
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

                    if (!columns.includes('enabled')) {
                        db.run(`ALTER TABLE users ADD COLUMN enabled INTEGER DEFAULT 0`, (errAlter) => {
                            if (errAlter) {
                                console.error('Error adding enabled column:', errAlter.message);
                            } else {
                                console.log('Added enabled column to users table.');
                                // Set existing users to enabled = 1
                                db.run(`UPDATE users SET enabled = 1 WHERE enabled IS NULL`, (errUpdate) => {
                                    if (errUpdate) {
                                        console.error('Error setting default for enabled column:', errUpdate.message);
                                    } else {
                                        console.log('Set enabled=1 for existing users.');
                                    }
                                });
                            }
                        });
                    }

                    if (!columns.includes('last_login')) {
                        db.run(`ALTER TABLE users ADD COLUMN last_login DATETIME`, (errAlter) => {
                            if (errAlter) {
                                console.error('Error adding last_login column:', errAlter.message);
                            } else {
                                console.log('Added last_login column to users table.');
                            }
                        });
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

                        // Check and add columns if they don't exist for backward compatibility
                        db.all('PRAGMA table_info(boards)', (errPragma, rows) => {
                            if (errPragma) {
                                console.error(
                                    'Error checking boards table info:',
                                    errPragma.message
                                );
                                return;
                            }
                            const boardColumns = rows.map((col) => col.name);

                            if (!boardColumns.includes('collection')) {
                                db.run(
                                    `ALTER TABLE boards ADD COLUMN collection TEXT`,
                                    (errAlter) => {
                                        if (errAlter) {
                                            console.error(
                                                'Error adding collection column to boards table:',
                                                errAlter.message
                                            );
                                        } else {
                                            console.log('Added collection column to boards table.');
                                        }
                                    }
                                );
                            }
                        });

                        db.run(`CREATE TABLE IF NOT EXISTS contacts (
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

                        const INITIAL_USER_ID = process.env.INITIAL_USER_ID || 'user';
                        const INITIAL_USER_PASSWORD =
                            process.env.INITIAL_USER_PASSWORD || 'password';
                        const INITIAL_USER_EMAIL =
                            process.env.INITIAL_USER_EMAIL || 'yokan.board@gmail.com';

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
                                        `INSERT INTO users (username, password, email, enabled) VALUES (?, ?, ?, 1)`,
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
