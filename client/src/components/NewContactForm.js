import React, { useState } from 'react';
import { Box, Button, TextField, Paper, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';

function NewContactForm({ onAdd }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [contact, setContact] = useState({
        name: '',
        title: '',
        company: '',
        email: '',
        phone: '',
        status: 'ACTIVE'
    });

    const handleChange = (field) => (e) => {
        setContact({ ...contact, [field]: e.target.value });
    };

    const handleSave = () => {
        if (contact.name.trim()) {
            onAdd(contact);
            setContact({
                name: '',
                title: '',
                company: '',
                email: '',
                phone: '',
                status: 'ACTIVE'
            });
            setIsExpanded(false);
        }
    };

    const handleCancel = () => {
        setIsExpanded(false);
        setContact({
            name: '',
            title: '',
            company: '',
            email: '',
            phone: '',
            status: 'ACTIVE'
        });
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
                    <Typography variant="subtitle1" gutterBottom>Add New Contact</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Full Name"
                            value={contact.name}
                            onChange={handleChange('name')}
                            size="small"
                            fullWidth
                            autoFocus
                        />
                        <TextField
                            label="Title"
                            value={contact.title}
                            onChange={handleChange('title')}
                            size="small"
                            fullWidth
                        />
                        <TextField
                            label="Company"
                            value={contact.company}
                            onChange={handleChange('company')}
                            size="small"
                            fullWidth
                        />
                        <TextField
                            label="Email"
                            value={contact.email}
                            onChange={handleChange('email')}
                            size="small"
                            fullWidth
                        />
                        <TextField
                            label="Phone"
                            value={contact.phone}
                            onChange={handleChange('phone')}
                            size="small"
                            fullWidth
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                            <Button startIcon={<CancelIcon />} onClick={handleCancel}>Cancel</Button>
                            <Button startIcon={<SaveIcon />} variant="contained" onClick={handleSave} disabled={!contact.name.trim()}>Add Contact</Button>
                        </Box>
                    </Box>
                </Paper>
            )}
        </Box>
    );
}

export default NewContactForm;
