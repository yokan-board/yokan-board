require('dotenv').config();
const db = require('../database');
const contactModel = require('../models/contact');

async function migrateContacts() {
    console.log('Starting contact migration in 2 seconds...');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
        const boards = await getAllBoards();
        console.log(`Found ${boards.length} boards to process.`);

        let totalMigratedCount = 0;

        for (const board of boards) {
            if (board.data && typeof board.data === 'string') {
                try {
                    const boardData = JSON.parse(board.data);
                    if (boardData.contacts && Array.isArray(boardData.contacts)) {
                        console.log(
                            `- Processing board "${board.name}" (ID: ${board.id}). Found ${boardData.contacts.length} contacts.`
                        );

                        for (const contact of boardData.contacts) {
                            try {
                                const contactData = {
                                    user_id: board.user_id,
                                    name: contact.name,
                                    title: contact.title || null,
                                    company: contact.company || null,
                                    email: contact.email || null,
                                    phone: contact.phone || null,
                                    avatarUrl: contact.avatarUrl || null,
                                    status: contact.status || 'ACTIVE',
                                };

                                // Don't migrate if email is null or empty, as it's part of the unique key
                                if (!contactData.email) {
                                    console.log(
                                        `  - Skipping contact "${contact.name}" due to missing email.`
                                    );
                                    continue;
                                }

                                await contactModel.createContact(contactData);
                                console.log(
                                    `  - Migrated contact: ${contact.name} (${contact.email})`
                                );
                                totalMigratedCount++;
                            } catch (err) {
                                if (err.code === 'SQLITE_CONSTRAINT') {
                                    console.log(
                                        `  - Contact already exists (skipping): ${contact.name} (${contact.email})`
                                    );
                                } else {
                                    console.error(
                                        `  - Error migrating contact "${contact.name}":`,
                                        err.message
                                    );
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.error(
                        `- Error parsing data for board ID ${board.id}, skipping.`,
                        e.message
                    );
                }
            }
        }

        console.log(`\nMigration complete. Successfully migrated ${totalMigratedCount} contacts.`);
    } catch (err) {
        console.error('A critical error occurred during migration:', err);
    } finally {
        db.close((err) => {
            if (err) {
                console.error('Error closing the database:', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    }
}

function getAllBoards() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT id, user_id, name, data FROM boards`, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

migrateContacts();
