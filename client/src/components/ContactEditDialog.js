import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControlLabel,
    Switch
} from '@mui/material';
import { formatPhoneNumber } from '../utils/phoneUtils';

function ContactEditDialog({ open, contact, onClose, onSave }) {
    const [editingContact, setEditingContact] = useState(null);

    useEffect(() => {
        if (contact) {
            setEditingContact({ ...contact });
        } else {
            setEditingContact(null);
        }
    }, [contact]);

    const handleEditChange = (field) => (e) => {
        setEditingContact({ ...editingContact, [field]: e.target.value });
    };

    const handleStatusChange = (e) => {
        setEditingContact({ ...editingContact, status: e.target.checked ? 'ACTIVE' : 'INACTIVE' });
    };

    const handleSave = () => {
        if (editingContact) {
            const toSave = {
                ...editingContact,
                phone: formatPhoneNumber(editingContact.phone)
            };
            onSave(toSave);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
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
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained" disabled={!editingContact?.name?.trim() || !editingContact?.email?.trim()}>
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ContactEditDialog;
