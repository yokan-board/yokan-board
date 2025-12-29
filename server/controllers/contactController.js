const contactModel = require('../models/contact');
const { AppError, NotFoundError } = require('../utils/appError');

function formatPhoneNumber(phone) {
    if (!phone) return phone;

    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');

    if (!cleaned) return cleaned;

    // If it doesn't start with +, assume it needs +1
    if (!cleaned.startsWith('+')) {
        if (cleaned.length === 11 && cleaned.startsWith('1')) {
            cleaned = '+' + cleaned;
        } else if (cleaned.length === 10) {
            cleaned = '+1' + cleaned;
        } else {
            cleaned = '+1' + cleaned;
        }
    }

    // Format if it matches the US/Canada pattern
    const match = cleaned.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return `+1 (${match[1]}) ${match[2]}-${match[3]}`;
    }

    return cleaned;
}

exports.bulkImportContacts = async (req, res, next) => {
    try {
        const { contacts, strategy } = req.body; // strategy: 'merge', 'skip', 'replace'
        if (!contacts || !Array.isArray(contacts)) {
            return next(new AppError('No contacts provided', 400));
        }

        const stats = {
            added: 0,
            merged: 0,
            skipped: 0,
            replaced: 0,
            errors: 0
        };

        const userId = req.user.id;
        const resolutionStrategy = strategy || 'merge';

        for (const contactData of contacts) {
            try {
                if (!contactData.email) {
                    stats.errors++;
                    continue;
                }

                const existing = await contactModel.getContactByEmail(userId, contactData.email);

                if (existing) {
                    if (resolutionStrategy === 'skip') {
                        stats.skipped++;
                        continue;
                    } else if (resolutionStrategy === 'replace') {
                        await contactModel.deleteContact(existing.id, userId);
                        await contactModel.createContact({
                            ...contactData,
                            user_id: userId,
                            phone: formatPhoneNumber(contactData.phone)
                        });
                        stats.replaced++;
                    } else {
                        // Default: merge
                        const updatedData = {
                            name: contactData.name || existing.name,
                            title: contactData.title || existing.title,
                            company: contactData.company || existing.company,
                            email: existing.email, // email stays same
                            phone: formatPhoneNumber(contactData.phone || existing.phone),
                            avatarUrl: contactData.avatarUrl || existing.avatarUrl,
                            status: contactData.status || existing.status
                        };
                        await contactModel.updateContact(existing.id, userId, updatedData);
                        stats.merged++;
                    }
                } else {
                    await contactModel.createContact({
                        ...contactData,
                        user_id: userId,
                        phone: formatPhoneNumber(contactData.phone)
                    });
                    stats.added++;
                }
            } catch (err) {
                console.error('Error importing single contact:', err);
                stats.errors++;
            }
        }

        res.json({ message: 'success', data: stats });
    } catch (err) {
        next(new AppError(err.message, 400));
    }
};

exports.getAllContacts = async (req, res, next) => {
    try {
        const contacts = await contactModel.getAllContactsByUserId(req.user.id);
        
        // Enrich contacts with usage count
        const enrichedContacts = await Promise.all(contacts.map(async (contact) => {
            const usageCount = await contactModel.getContactUsageCount(contact.id, req.user.id);
            return { ...contact, usageCount };
        }));

        res.json({ message: 'success', data: enrichedContacts });
    } catch (err) {
        next(new AppError(err.message, 400));
    }
};

exports.getContactUsage = async (req, res, next) => {
    try {
        const usageCount = await contactModel.getContactUsageCount(req.params.id, req.user.id);
        res.json({ message: 'success', data: { usageCount } });
    } catch (err) {
        next(new AppError(err.message, 400));
    }
};

exports.createContact = async (req, res, next) => {
    try {
        const contactData = { 
            ...req.body, 
            user_id: req.user.id,
            phone: formatPhoneNumber(req.body.phone)
        };
        const newContact = await contactModel.createContact(contactData);
        res.status(201).json({ message: 'success', data: newContact });
    } catch (err) {
        // Handle unique constraint error
        if (err.code === 'SQLITE_CONSTRAINT') {
            return next(new AppError('A contact with this email already exists.', 409));
        }
        next(new AppError(err.message, 400));
    }
};

exports.getContact = async (req, res, next) => {
    try {
        const contact = await contactModel.getContactById(req.params.id, req.user.id);
        if (!contact) {
            return next(new NotFoundError('Contact not found'));
        }
        res.json({ message: 'success', data: contact });
    } catch (err) {
        next(new AppError(err.message, 400));
    }
};

exports.updateContact = async (req, res, next) => {
    try {
        const updatedData = {
            ...req.body,
            phone: formatPhoneNumber(req.body.phone)
        };
        const result = await contactModel.updateContact(req.params.id, req.user.id, updatedData);
        if (result.changes === 0) {
            return next(new NotFoundError('Contact not found or no changes made'));
        }
        res.json({ message: 'success', changes: result.changes });
    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
            return next(new AppError('A contact with this email already exists.', 409));
        }
        next(new AppError(err.message, 400));
    }
};

exports.deleteContact = async (req, res, next) => {
    try {
        const result = await contactModel.deleteContact(req.params.id, req.user.id);
        if (result.changes === 0) {
            return next(new NotFoundError('Contact not found'));
        }
        res.status(204).send();
    } catch (err) {
        next(new AppError(err.message, 400));
    }
};

exports.searchContacts = async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.json({ message: 'success', data: [] });
        }
        const contacts = await contactModel.searchContacts(req.user.id, q);
        res.json({ message: 'success', data: contacts });
    } catch (err) {
        next(new AppError(err.message, 400));
    }
};
