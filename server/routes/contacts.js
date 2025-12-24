const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const contactValidation = require('../validation/contactValidation');
const { validate } = require('../middleware/validationMiddleware');

// Search for contacts
router.get('/search', contactValidation.validateSearchQuery, validate, contactController.searchContacts);

// GET all contacts for the user
router.get('/', contactController.getAllContacts);

// POST a new contact
router.post('/', contactValidation.validateContact, validate, contactController.createContact);

// GET contact usage info
router.get('/:id/usage', contactValidation.validateContactId, validate, contactController.getContactUsage);

// GET a single contact by ID
router.get('/:id', contactValidation.validateContactId, validate, contactController.getContact);

// PUT to update a contact by ID
router.put('/:id', [...contactValidation.validateContactId, ...contactValidation.validateContact], validate, contactController.updateContact);

// DELETE a contact by ID
router.delete('/:id', contactValidation.validateContactId, validate, contactController.deleteContact);

module.exports = router;
