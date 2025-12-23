const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const contactValidation = require('../validation/contactValidation');
const { validationResult } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validationMiddleware');

// Middleware to check for validation errors
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Search for contacts
router.get('/search', contactValidation.validateSearchQuery, handleValidationErrors, contactController.searchContacts);

// GET all contacts for the user
router.get('/', contactController.getAllContacts);

// POST a new contact
router.post('/', contactValidation.validateContact, handleValidationErrors, contactController.createContact);

// GET a single contact by ID
router.get('/:id', contactValidation.validateContactId, handleValidationErrors, contactController.getContact);

// PUT to update a contact by ID
router.put('/:id', [...contactValidation.validateContactId, ...contactValidation.validateContact], handleValidationErrors, contactController.updateContact);

// DELETE a contact by ID
router.delete('/:id', contactValidation.validateContactId, handleValidationErrors, contactController.deleteContact);

module.exports = router;
