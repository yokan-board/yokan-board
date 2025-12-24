import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControlLabel,
    Switch
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import contactService from '../../services/contactService';
import { getGravatarUrl } from '../../utils/gravatar';

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

    const handleSaveEdit = async () => {
        try {
            await contactService.updateContact(editingContact.id, editingContact);
            fetchContacts();
            handleCloseEdit();
        } catch (error) {
            console.error('Error updating contact:', error);
            alert(error.response?.data?.message || 'Failed to update contact.');
        }
    };

    const handleEditChange = (field) => (e) => {
        setEditingContact({ ...editingContact, [field]: e.target.value });
    };

    const handleStatusChange = (e) => {
        setEditingContact({ ...editingContact, status: e.target.checked ? 'ACTIVE' : 'INACTIVE' });
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
                            primary={contact.name}
                            secondary={`${contact.title || ''}${contact.title && contact.company ? ' at ' : ''}${contact.company || ''}`}
                        />
                    </ListItem>
                ))}
            </List>

            <Dialog open={isEditDialogOpen} onClose={handleCloseEdit} fullWidth maxWidth="sm">
                <DialogTitle>Edit Contact</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Full Name"
                            value={editingContact?.name || ''}
                            onChange={handleEditChange('name')}
                            fullWidth
                            size="small"
                        />
                        <TextField
                            label="Email"
                            value={editingContact?.email || ''}
                            onChange={handleEditChange('email')}
                            fullWidth
                            size="small"
                        />
                        <TextField
                            label="Title"
                            value={editingContact?.title || ''}
                            onChange={handleEditChange('title')}
                            fullWidth
                            size="small"
                        />
                        <TextField
                            label="Company"
                            value={editingContact?.company || ''}
                            onChange={handleEditChange('company')}
                            fullWidth
                            size="small"
                        />
                        <TextField
                            label="Phone"
                            value={editingContact?.phone || ''}
                            onChange={handleEditChange('phone')}
                            fullWidth
                            size="small"
                        />
                        <TextField
                            label="Avatar URL"
                            value={editingContact?.avatarUrl || ''}
                            onChange={handleEditChange('avatarUrl')}
                            fullWidth
                            size="small"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={editingContact?.status === 'ACTIVE'}
                                    onChange={handleStatusChange}
                                    color="primary"
                                />
                            }
                            label={editingContact?.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEdit}>Cancel</Button>
                    <Button onClick={handleSaveEdit} variant="contained">Save Changes</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default ContactsSettings;
