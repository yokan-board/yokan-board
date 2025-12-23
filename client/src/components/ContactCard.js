import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Avatar, TextField, Switch, FormControlLabel, Card, CardContent, CardActions, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { getGravatarUrl } from '../utils/gravatar';

function ContactCard({ contact, onUpdate, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContact, setEditedContact] = useState(contact);

    useEffect(() => {
        setEditedContact(contact);
    }, [contact]);

    const handleSave = () => {
        onUpdate(editedContact);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedContact(contact);
        setIsEditing(false);
    };

    const handleDelete = () => {
        onDelete(contact.id);
    };

    const handleStatusChange = (e) => {
        const newStatus = e.target.checked ? 'ACTIVE' : 'INACTIVE';
        const updated = { ...editedContact, status: newStatus };
        setEditedContact(updated);
        if (!isEditing) {
            onUpdate(updated);
        }
    };

    const isInactive = contact.status === 'INACTIVE';

    if (isEditing) {
        return (
            <Card sx={{ 
                width: '24rem', 
                height: '14.8rem', 
                flexShrink: 0, 
                mb: 2, 
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '8px'
            }}>
                <CardContent sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <Avatar
                            src={editedContact.avatarUrl || getGravatarUrl(editedContact.email)}
                            sx={{ width: 56, height: 56 }}
                        />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1 }}>
                            <TextField
                                label="Avatar URL"
                                value={editedContact.avatarUrl || ''}
                                onChange={(e) => setEditedContact({ ...editedContact, avatarUrl: e.target.value })}
                                size="small"
                                fullWidth
                                placeholder="https://example.com/avatar.png"
                            />
                            <TextField
                                label="Full Name"
                                value={editedContact.name}
                                onChange={(e) => setEditedContact({ ...editedContact, name: e.target.value })}
                                size="small"
                                fullWidth
                            />
                            <TextField
                                label="Title"
                                value={editedContact.title}
                                onChange={(e) => setEditedContact({ ...editedContact, title: e.target.value })}
                                size="small"
                                fullWidth
                            />
                            <TextField
                                label="Company"
                                value={editedContact.company}
                                onChange={(e) => setEditedContact({ ...editedContact, company: e.target.value })}
                                size="small"
                                fullWidth
                            />
                            <TextField
                                label="Email"
                                value={editedContact.email}
                                onChange={(e) => setEditedContact({ ...editedContact, email: e.target.value })}
                                size="small"
                                fullWidth
                            />
                            <TextField
                                label="Phone"
                                value={editedContact.phone}
                                onChange={(e) => setEditedContact({ ...editedContact, phone: e.target.value })}
                                size="small"
                                fullWidth
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={editedContact.status === 'ACTIVE'}
                                        onChange={handleStatusChange}
                                        color="primary"
                                    />
                                }
                                label={editedContact.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                            />
                        </Box>
                    </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                    <Button size="small" startIcon={<CancelIcon />} onClick={handleCancel}>Cancel</Button>
                    <Button size="small" startIcon={<SaveIcon />} variant="contained" onClick={handleSave}>Save</Button>
                </CardActions>
            </Card>
        );
    }

    return (
        <Card sx={{ 
            width: '24rem', 
            height: '14.8rem', 
            flexShrink: 0, 
            mb: 2, 
            opacity: isInactive ? 0.6 : 1, 
            transition: 'opacity 0.3s',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            borderRadius: '8px'
        }}>
            <CardContent sx={{ flexGrow: 1, overflowY: 'auto' }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Avatar
                        src={contact.avatarUrl || getGravatarUrl(contact.email)}
                        sx={{ width: 56, height: 56 }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6">{contact.name}</Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            {contact.title} {contact.title && contact.company ? 'at' : ''} {contact.company}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                             {contact.email && (
                                <Typography variant="body2" color="text.primary">
                                    {contact.email}
                                </Typography>
                            )}
                            {contact.phone && (
                                <Typography variant="body2" color="text.primary">
                                    {contact.phone}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <IconButton size="small" onClick={() => setIsEditing(true)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={handleDelete}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>
                <Box sx={{ 
                    position: 'absolute', 
                    bottom: 12, 
                    right: 16,
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <Typography variant="caption" sx={{
                        color: isInactive ? 'text.disabled' : 'success.main',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                    }}>
                        {contact.status}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}

export default ContactCard;
