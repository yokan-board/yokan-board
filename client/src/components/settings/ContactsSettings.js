import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import contactService from '../../services/contactService';
import { getGravatarUrl } from '../../utils/gravatar';
import ContactEditDialog from '../ContactEditDialog';

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
            <List>
                {contacts.map((contact) => (
                    <ListItem
                        key={contact.id}
                        secondaryAction={
                            <>
                                <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(contact)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(contact.id)} sx={{ ml: 1 }}>
                                    <DeleteIcon />
                                </IconButton>
                            </>
                        }
                    >
                        <ListItemAvatar>
                            <Avatar src={contact.avatarUrl || getGravatarUrl(contact.email)} />
                        </ListItemAvatar>
                        <ListItemText
                            primary={`${contact.name} (${contact.email})`}
                            secondary={`${contact.title || ''}${contact.title && contact.company ? ' at ' : ''}${contact.company || ''}`}
                        />
                    </ListItem>
                ))}
            </List>

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
