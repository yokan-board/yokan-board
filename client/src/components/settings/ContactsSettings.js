import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography
} from '@mui/material';
import contactService from '../../services/contactService';
import ContactEditDialog from '../ContactEditDialog';
import ContactCard from '../ContactCard';

function ContactsSettings() {
    const [contacts, setContacts] = useState([]);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingContact, setEditingContact] = useState(null);

    const fetchContacts = async () => {
        try {
            const fetchedContacts = await contactService.getContacts();
            setContacts(fetchedContacts);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this contact? This action cannot be undone.')) {
            try {
                await contactService.deleteContact(id);
                fetchContacts(); // Refresh the list
            } catch (error) {
                console.error('Error deleting contact:', error);
            }
        }
    };

    const handleEdit = (contact) => {
        setEditingContact({ ...contact });
        setIsEditDialogOpen(true);
    };

    const handleCloseEdit = () => {
        setIsEditDialogOpen(false);
        setEditingContact(null);
    };

    const handleSaveEdit = async (updatedContact) => {
        try {
            await contactService.updateContact(updatedContact.id, updatedContact);
            fetchContacts();
            handleCloseEdit();
        } catch (error) {
            console.error('Error updating contact:', error);
            alert(error.response?.data?.message || 'Failed to update contact.');
        }
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>All Contacts</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                This is a centralized list of all your contacts from across all boards.
            </Typography>
            <Box sx={{ mt: 2 }}>
                {contacts.map((contact) => (
                    <ContactCard
                        key={contact.id}
                        contact={contact}
                        viewMode="list"
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isDeleteDisabled={contact.usageCount > 0}
                        deleteTooltip={contact.usageCount > 0 ? "This contact is referenced by one or more boards and cannot be deleted." : ""}
                    />
                ))}
            </Box>

            <ContactEditDialog
                open={isEditDialogOpen}
                contact={editingContact}
                onClose={handleCloseEdit}
                onSave={handleSaveEdit}
            />
        </Box>
    );
}

export default ContactsSettings;
