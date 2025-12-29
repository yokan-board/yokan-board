require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DBSOURCE = process.env.DB_FILE || 'db.sqlite';
const dbPath = path.isAbsolute(DBSOURCE) ? DBSOURCE : path.join(__dirname, '..', DBSOURCE);

const db = new sqlite3.Database(dbPath);

function formatPhoneNumber(phone) {
    if (!phone) return null;

    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');

    // If it doesn't start with +, assume it needs +1
    if (!cleaned.startsWith('+')) {
        // If it starts with 1 and has 11 digits, add +
        if (cleaned.length === 11 && cleaned.startsWith('1')) {
            cleaned = '+' + cleaned;
        } else if (cleaned.length === 10) {
            // 10 digits, add +1
            cleaned = '+1' + cleaned;
        } else {
            // Other length, just prepend +1 if it doesn't have it
            cleaned = '+1' + cleaned;
        }
    }

    // Now format if it's a +1 US/Canada number
    const match = cleaned.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return `+1 (${match[1]}) ${match[2]}-${match[3]}`;
    }

    // Fallback for other international numbers: just keep as is with +
    return cleaned;
}

db.all('SELECT id, phone FROM contacts', [], (err, rows) => {
    if (err) {
        console.error(err.message);
        process.exit(1);
    }

    console.log(`Checking ${rows.length} contacts...`);
    let updatedCount = 0;

    rows.forEach((row) => {
        if (row.phone) {
            const formatted = formatPhoneNumber(row.phone);
            if (formatted !== row.phone) {
                db.run(
                    'UPDATE contacts SET phone = ? WHERE id = ?',
                    [formatted, row.id],
                    function (err) {
                        if (err) {
                            console.error(`Error updating contact ${row.id}:`, err.message);
                        }
                    }
                );
                updatedCount++;
            }
        }
    });

    console.log(`Migration finished. Updated ${updatedCount} phone numbers.`);
    // Close the database after a short delay to allow updates to finish
    setTimeout(() => db.close(), 2000);
});
