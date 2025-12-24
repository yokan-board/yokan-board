import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, TextField, Paper, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import { debounce } from 'lodash';
import contactService from '../services/contactService';

const initialContactState = {
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    avatarUrl: '',
    status: 'ACTIVE',
};

function NewContactForm({ onAdd }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [contact, setContact] = useState(initialContactState);
    const [isExisting, setIsExisting] = useState(false);

    const resetForm = () => {
        setContact(initialContactState);
        setIsExisting(false);
    };

    const handleSave = () => {
        if (contact.name.trim() && contact.email.trim()) {
            onAdd(contact);
            resetForm();
            setIsExpanded(false);
        }
    };

    const handleCancel = () => {
        setIsExpanded(false);
        resetForm();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const search = useCallback(
        debounce(async (query) => {
            if (query.length > 2) {
                try {
                    const results = await contactService.searchContacts(query);
                    if (results.length === 1) {
                        const found = results[0];
                        setContact({
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
                    } else {
                        // If query changes and doesn't match, clear other fields
                        if (isExisting) {
                            const currentEmail = contact.email;
                            resetForm();
                            setContact(c => ({...c, email: currentEmail}));
                        }
                        setIsExisting(false);
                    }
                } catch (error) {
                    console.error('Error searching contacts:', error);
                }
            } else {
                 if (isExisting) {
                    const currentEmail = contact.email;
                    resetForm();
                    setContact(c => ({...c, email: currentEmail}));
                }
                setIsExisting(false);
            }
        }, 300),
        [isExisting, contact.email]
    );

    useEffect(() => {
        search(contact.email);
    }, [contact.email, search]);

    const handleChange = (field) => (e) => {
        setContact({ ...contact, [field]: e.target.value });
    };

    return (
        <Box sx={{ mt: 2, mb: 2 }}>
            {!isExpanded ? (
                <Button
                    startIcon={<AddIcon />}
                    onClick={() => setIsExpanded(true)}
                    variant="outlined"
                    fullWidth
                >
                    Add New Contact
                </Button>
            ) : (
                <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        {isExisting ? 'Existing Contact Found' : 'Add New Contact'}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Email"
                            value={contact.email}
                            onChange={handleChange('email')}
                            size="small"
                            fullWidth
                            autoFocus
                            helperText="Start typing an email to find an existing contact."
                        />
                         <TextField
                            label="Full Name"
                            value={contact.name}
                            onChange={handleChange('name')}
                            size="small"
                            fullWidth
                            InputProps={{ readOnly: isExisting }}
                        />
                        <TextField
                            label="Avatar URL"
                            value={contact.avatarUrl}
                            onChange={handleChange('avatarUrl')}
                            size="small"
                            fullWidth
                            placeholder="https://example.com/avatar.png"
                            InputProps={{ readOnly: isExisting }}
                        />
                        <TextField
                            label="Title"
                            value={contact.title}
                            onChange={handleChange('title')}
                            size="small"
                            fullWidth
                            InputProps={{ readOnly: isExisting }}
                        />
                        <TextField
                            label="Company"
                            value={contact.company}
                            onChange={handleChange('company')}
                            size="small"
                            fullWidth
                             InputProps={{ readOnly: isExisting }}
                        />
                        <TextField
                            label="Phone"
                            value={contact.phone}
                            onChange={handleChange('phone')}
                            size="small"
                            fullWidth
                            InputProps={{ readOnly: isExisting }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                            <Button startIcon={<CancelIcon />} onClick={handleCancel}>Cancel</Button>
                            <Button 
                                startIcon={<SaveIcon />} 
                                variant="contained" 
                                onClick={handleSave} 
                                disabled={!contact.name.trim() || !contact.email.trim()}
                            >
                                {isExisting ? 'Link Contact' : 'Add Contact'}
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            )}
        </Box>
    );
}

export default NewContactForm;
