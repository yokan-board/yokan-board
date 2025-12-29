import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
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

    const handleAdd = () => {
        setEditingContact(null);
        setIsEditDialogOpen(true);
    };

    const handleCloseEdit = () => {
        setIsEditDialogOpen(false);
        setEditingContact(null);
    };

    const handleSaveEdit = async (contact) => {
        try {
            if (contact.id) {
                await contactService.updateContact(contact.id, contact);
            } else {
                await contactService.createContact(contact);
            }
            fetchContacts();
            handleCloseEdit();
        } catch (error) {
            console.error('Error saving contact:', error);
            alert(error.response?.data?.message || 'Failed to save contact.');
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                    <Typography variant="h6" gutterBottom>All Contacts</Typography>
                    <Typography variant="body2" color="text.secondary">
                        This is a centralized list of all your contacts from across all boards.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAdd}
                >
                    Add Contact
                </Button>
            </Box>
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
