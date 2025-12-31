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
    Divider,
    Avatar,
    Alert,
} from '@mui/material';
import { debounce } from 'lodash';
import { formatPhoneNumber } from '../utils/phoneUtils';
import contactService from '../services/contactService';
import { getGravatarUrl } from '../utils/gravatar';

const initialContactState = {
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    avatarUrl: '',
    status: 'ACTIVE',
    tags: [],
};

function ContactEditDialog({ open, contact, onClose, onSave, availableTags = [] }) {
    const [editingContact, setEditingContact] = useState(initialContactState);
    const [isExisting, setIsExisting] = useState(false);
    const [foundContact, setFoundContact] = useState(null);
    const [tagInput, setTagInput] = useState('');

    const suggestedTags = useMemo(() => {
        return availableTags.filter((tag) => !editingContact.tags?.includes(tag));
    }, [availableTags, editingContact.tags]);

    useEffect(() => {
        if (contact) {
            setEditingContact({ ...initialContactState, ...contact, tags: contact.tags || [] });
            setIsExisting(false);
        } else {
            setEditingContact(initialContactState);
            setIsExisting(false);
        }
        setFoundContact(null);
        setTagInput('');
    }, [contact, open]);

    const debouncedSearch = useMemo(
        () =>
            debounce(async (query, isEditMode) => {
                if (isEditMode || query.length <= 2) return;

                try {
                    const results = await contactService.searchContacts(query);
                    // Look for an exact email match first
                    const exactMatch = results.find((r) => r.email.toLowerCase() === query.toLowerCase());
                    
                    if (exactMatch) {
                        setFoundContact(exactMatch);
                    } else if (results.length === 1) {
                        setFoundContact(results[0]);
                    } else {
                         setFoundContact(null);
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
        setEditingContact((prev) => {
            const newState = { ...prev, [field]: value };
            
            // If email changes, check against foundContact
            if (field === 'email') {
                if (foundContact && foundContact.email.toLowerCase() !== value.toLowerCase()) {
                    setFoundContact(null);
                }
                
                // If we were linked to an existing contact, break the link
                if (isExisting) {
                    setIsExisting(false);
                    // Remove ID to prevent overwriting the original contact
                    const { id, ...rest } = newState;
                    return rest;
                }
            }
            return newState;
        });
    };

    const handleLinkContact = () => {
        if (!foundContact) return;
        setEditingContact({
            id: foundContact.id,
            name: foundContact.name,
            title: foundContact.title || '',
            company: foundContact.company || '',
            email: foundContact.email,
            phone: foundContact.phone || '',
            avatarUrl: foundContact.avatarUrl || '',
            status: foundContact.status || 'ACTIVE',
            tags: foundContact.tags || [],
        });
        setIsExisting(true);
        setFoundContact(null);
    };

    const handleStatusChange = (e) => {
        setEditingContact({ ...editingContact, status: e.target.checked ? 'ACTIVE' : 'INACTIVE' });
    };

    const handleAddTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!editingContact.tags.includes(tagInput.trim())) {
                setEditingContact((prev) => ({
                    ...prev,
                    tags: [...prev.tags, tagInput.trim()],
                }));
            }
            setTagInput('');
        }
    };

    const handleDeleteTag = (tagToDelete) => {
        setEditingContact((prev) => ({
            ...prev,
            tags: prev.tags.filter((tag) => tag !== tagToDelete),
        }));
    };

    const handleSave = () => {
        if (editingContact) {
            const toSave = {
                ...editingContact,
                phone: formatPhoneNumber(editingContact.phone),
            };
            onSave(toSave);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {isEditMode ? 'Edit Contact' : isExisting ? 'Existing Contact Linked' : 'Add New Contact'}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    {foundContact && !isExisting && !isEditMode && (
                        <Alert 
                            severity="info" 
                            action={
                                <Button color="inherit" size="small" onClick={handleLinkContact}>
                                    Link
                                </Button>
                            }
                            sx={{ mb: 1 }}
                        >
                            Found existing contact: <strong>{foundContact.name}</strong> ({foundContact.email})
                        </Alert>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                        <Avatar
                            src={editingContact.avatarUrl || getGravatarUrl(editingContact.email)}
                            sx={{ width: 80, height: 80 }}
                        />
                    </Box>
                    <TextField
                        label="Email"
                        value={editingContact.email || ''}
                        onChange={handleEditChange('email')}
                        fullWidth
                        size="small"
                        autoFocus={!isEditMode}
                        helperText={
                            !isEditMode && !isExisting && !foundContact ? 'Start typing an email to find an existing contact.' : ''
                        }
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
                        {editingContact.tags?.map((tag) => (
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
                                            setEditingContact((prev) => ({
                                                ...prev,
                                                tags: [...prev.tags, tag],
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
                <Button variant="outlined" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={!editingContact?.name?.trim() || !editingContact?.email?.trim() || (foundContact && !isExisting && !isEditMode)}
                >
                    {isEditMode ? 'Save Changes' : isExisting ? 'Link Contact' : 'Add Contact'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ContactEditDialog;
