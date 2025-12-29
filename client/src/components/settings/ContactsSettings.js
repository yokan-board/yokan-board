import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import contactService from '../../services/contactService';
import ContactEditDialog from '../ContactEditDialog';
import ContactCard from '../ContactCard';

function ContactsSettings() {
    const [contacts, setContacts] = useState([]);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [sortBy, setSortBy] = useState(() => {
        return localStorage.getItem('contactsSortBy') || 'name';
    });

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

    const handleSortChange = (event) => {
        const newSortBy = event.target.value;
        setSortBy(newSortBy);
        localStorage.setItem('contactsSortBy', newSortBy);
    };

    // Helper to extract last name
    const getLastNameInfo = (fullName) => {
        if (!fullName) return { lastName: '', rest: '' };
        const parts = fullName.trim().split(/\s+/);
        if (parts.length === 1) return { lastName: parts[0], rest: '' };
        const lastName = parts.pop();
        const rest = parts.join(' ');
        return { lastName, rest };
    };

    const groupedContacts = useMemo(() => {
        const sorted = [...contacts].sort((a, b) => {
            let valA = '', valB = '';

            if (sortBy === 'name') {
                valA = a.name || '';
                valB = b.name || '';
            } else if (sortBy === 'company') {
                valA = a.company || '';
                valB = b.company || '';
                // Secondary sort by name
                if (valA === valB) {
                    return (a.name || '').localeCompare(b.name || '');
                }
            } else if (sortBy === 'lastName') {
                valA = getLastNameInfo(a.name).lastName;
                valB = getLastNameInfo(b.name).lastName;
                // Secondary sort by first name
                if (valA === valB) {
                    return (a.name || '').localeCompare(b.name || '');
                }
            } else if (sortBy === 'title') {
                valA = a.title || '';
                valB = b.title || '';
                // Secondary sort by name
                if (valA === valB) {
                    return (a.name || '').localeCompare(b.name || '');
                }
            }
            
            return valA.localeCompare(valB);
        });

        const groups = {};

        sorted.forEach(contact => {
            let groupKey = '';
            let displayContact = { ...contact };

            if (sortBy === 'name') {
                groupKey = (contact.name || '#')[0].toUpperCase();
            } else if (sortBy === 'company') {
                groupKey = contact.company || 'No Company';
            } else if (sortBy === 'lastName') {
                const { lastName, rest } = getLastNameInfo(contact.name);
                groupKey = (lastName || '#')[0].toUpperCase();
                if (lastName && rest) {
                    displayContact.name = `${lastName}, ${rest}`;
                }
            } else if (sortBy === 'title') {
                groupKey = (contact.title || 'No Title')[0].toUpperCase();
            }

            // Handle non-letter keys for name/title sorts if necessary, ensuring everything falls into a bucket
            if (!groupKey || !groupKey.match(/[A-Z0-9]/i) && sortBy !== 'company') {
                groupKey = '#';
            }

            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(displayContact);
        });

        return groups;
    }, [contacts, sortBy]);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                    <Typography variant="h6" gutterBottom>All Contacts</Typography>
                    <Typography variant="body2" color="text.secondary">
                        This is a centralized list of all your contacts from across all boards.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel id="sort-by-label">Sort By</InputLabel>
                        <Select
                            labelId="sort-by-label"
                            id="sort-by-select"
                            value={sortBy}
                            label="Sort By"
                            onChange={handleSortChange}
                        >
                            <MenuItem value="name">Full Name</MenuItem>
                            <MenuItem value="company">Company</MenuItem>
                            <MenuItem value="lastName">Last Name</MenuItem>
                            <MenuItem value="title">Title</MenuItem>
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAdd}
                    >
                        Add Contact
                    </Button>
                </Box>
            </Box>
            
            <Box sx={{ mt: 2 }}>
                {Object.entries(groupedContacts).map(([group, groupContacts]) => (
                    <Box key={group} sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ 
                            color: 'text.secondary', 
                            borderBottom: '1px solid', 
                            borderColor: 'divider', 
                            mb: 2, 
                            pb: 0.5 
                        }}>
                            {group}
                        </Typography>
                        {groupContacts.map((contact) => (
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
                ))}
                {contacts.length === 0 && (
                     <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
                         No contacts found. Click "Add Contact" to create one.
                     </Typography>
                )}
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
