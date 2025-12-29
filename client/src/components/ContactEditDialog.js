import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControlLabel,
    Switch,
    Chip,
    Typography,
    Divider
} from '@mui/material';
import { debounce } from 'lodash';
import { formatPhoneNumber } from '../utils/phoneUtils';
import contactService from '../services/contactService';

const initialContactState = {
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    avatarUrl: '',
    status: 'ACTIVE',
    tags: []
};

function ContactEditDialog({ open, contact, onClose, onSave, availableTags = [] }) {
    const [editingContact, setEditingContact] = useState(initialContactState);
    const [isExisting, setIsExisting] = useState(false);
    const [tagInput, setTagInput] = useState('');

    const suggestedTags = useMemo(() => {
        return availableTags.filter(tag => !editingContact.tags.includes(tag));
    }, [availableTags, editingContact.tags]);

    useEffect(() => {
        if (contact) {
            setEditingContact({ ...initialContactState, ...contact, tags: contact.tags || [] });
            setIsExisting(false);
        } else {
            setEditingContact(initialContactState);
            setIsExisting(false);
        }
        setTagInput('');
    }, [contact, open]);

    const debouncedSearch = useMemo(
        () => debounce(async (query, isEditMode) => {
            if (isEditMode || query.length <= 2) return;

            try {
                const results = await contactService.searchContacts(query);
                // Look for an exact email match first
                const exactMatch = results.find(r => r.email.toLowerCase() === query.toLowerCase());
                
                if (exactMatch) {
                    setEditingContact({
                        id: exactMatch.id,
                        name: exactMatch.name,
                        title: exactMatch.title || '',
                        company: exactMatch.company || '',
                        email: exactMatch.email,
                        phone: exactMatch.phone || '',
                        avatarUrl: exactMatch.avatarUrl || '',
                        status: exactMatch.status || 'ACTIVE',
                    });
                    setIsExisting(true);
                } else if (results.length === 1) {
                    // Fallback to single result if it's close enough (though exact email is preferred)
                    const found = results[0];
                    setEditingContact({
                        id: found.id,
                        name: found.name,
                        title: found.title || '',
                        company: found.company || '',
                        email: found.email,
                        phone: found.phone || '',
                        avatarUrl: found.avatarUrl || '',
                        status: found.status || 'ACTIVE',
                    });
                    setIsExisting(true);
                }
            } catch (error) {
                console.error('Error searching contacts:', error);
            }
        }, 500),
        []
    );

    const isEditMode = !!contact;

    useEffect(() => {
        if (!isEditMode && open && editingContact.email) {
            debouncedSearch(editingContact.email, isEditMode);
        }
        return () => debouncedSearch.cancel();
    }, [editingContact.email, debouncedSearch, isEditMode, open]);

    const handleEditChange = (field) => (e) => {
        const value = e.target.value;
        setEditingContact(prev => ({ ...prev, [field]: value }));
        
        // If we were in "existing" mode and user changed the email, we might need to drop out of it
        if (field === 'email' && isExisting) {
            setIsExisting(false);
            // We don't reset all fields immediately because user might just be correcting a typo
        }
    };

    const handleStatusChange = (e) => {
        setEditingContact({ ...editingContact, status: e.target.checked ? 'ACTIVE' : 'INACTIVE' });
    };

    const handleAddTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!editingContact.tags.includes(tagInput.trim())) {
                setEditingContact(prev => ({
                    ...prev,
                    tags: [...prev.tags, tagInput.trim()]
                }));
            }
            setTagInput('');
        }
    };

    const handleDeleteTag = (tagToDelete) => {
        setEditingContact(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToDelete)
        }));
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
            <DialogTitle>
                {isEditMode ? 'Edit Contact' : (isExisting ? 'Existing Contact Found' : 'Add New Contact')}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        label="Email"
                        value={editingContact.email || ''}
                        onChange={handleEditChange('email')}
                        fullWidth
                        size="small"
                        autoFocus={!isEditMode}
                        helperText={!isEditMode && !isExisting ? "Start typing an email to find an existing contact." : ""}
                    />
                    <TextField
                        label="Full Name"
                        value={editingContact.name || ''}
                        onChange={handleEditChange('name')}
                        fullWidth
                        size="small"
                        InputProps={{ readOnly: isExisting && !isEditMode }}
                    />
                    <TextField
                        label="Title"
                        value={editingContact.title || ''}
                        onChange={handleEditChange('title')}
                        fullWidth
                        size="small"
                        InputProps={{ readOnly: isExisting && !isEditMode }}
                    />
                    <TextField
                        label="Company"
                        value={editingContact.company || ''}
                        onChange={handleEditChange('company')}
                        fullWidth
                        size="small"
                        InputProps={{ readOnly: isExisting && !isEditMode }}
                    />
                    <TextField
                        label="Phone"
                        value={editingContact.phone || ''}
                        onChange={handleEditChange('phone')}
                        fullWidth
                        size="small"
                        InputProps={{ readOnly: isExisting && !isEditMode }}
                    />
                    <TextField
                        label="Avatar URL"
                        value={editingContact.avatarUrl || ''}
                        onChange={handleEditChange('avatarUrl')}
                        fullWidth
                        size="small"
                        InputProps={{ readOnly: isExisting && !isEditMode }}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={editingContact.status === 'ACTIVE'}
                                onChange={handleStatusChange}
                                color="primary"
                                disabled={isExisting && !isEditMode}
                            />
                        }
                        label={editingContact.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                    />

                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary">
                        Board-specific Tags
                    </Typography>
                    <TextField
                        label="Add Tag (Press Enter)"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        fullWidth
                        size="small"
                        placeholder="e.g. Solution Architect"
                    />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, minHeight: '32px' }}>
                        {editingContact.tags.map((tag) => (
                            <Chip
                                key={tag}
                                label={tag}
                                onDelete={() => handleDeleteTag(tag)}
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                        ))}
                    </Box>

                    {suggestedTags.length > 0 && (
                        <>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                Suggested Tags (click to add)
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {suggestedTags.map((tag) => (
                                    <Chip
                                        key={tag}
                                        label={tag}
                                        onClick={() => {
                                            setEditingContact(prev => ({
                                                ...prev,
                                                tags: [...prev.tags, tag]
                                            }));
                                        }}
                                        size="small"
                                        variant="outlined"
                                        sx={{ cursor: 'pointer', fontSize: '0.7rem' }}
                                    />
                                ))}
                            </Box>
                        </>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button variant="outlined" onClick={onClose}>Cancel</Button>
                <Button 
                    onClick={handleSave} 
                    variant="contained" 
                    disabled={!editingContact?.name?.trim() || !editingContact?.email?.trim()}
                >
                    {isEditMode ? 'Save Changes' : (isExisting ? 'Link Contact' : 'Add Contact')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ContactEditDialog;
