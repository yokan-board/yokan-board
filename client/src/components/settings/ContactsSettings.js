import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import contactService from '../../services/contactService';
import ContactEditDialog from '../ContactEditDialog';
import ContactCard from '../ContactCard';
import SettingsMenu from '../SettingsMenu';
import ImportContactsDialog from '../ImportContactsDialog';

function ContactsSettings() {
    const [contacts, setContacts] = useState([]);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
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

    const handleExportJson = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(contacts, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `yokan-contacts-${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleExportCsv = () => {
        const headers = ['Name', 'Title', 'Company', 'Email', 'Phone', 'Status', 'Avatar URL'];
        const csvRows = [headers.join(',')];

        contacts.forEach(contact => {
            const row = [
                `"${(contact.name || '').replace(/"/g, '""')}"`,
                `"${(contact.title || '').replace(/"/g, '""')}"`,
                `"${(contact.company || '').replace(/"/g, '""')}"`,
                `"${(contact.email || '').replace(/"/g, '""')}"`,
                `"${(contact.phone || '').replace(/"/g, '""')}"`,
                `"${(contact.status || '').replace(/"/g, '""')}"`,
                `"${(contact.avatarUrl || '').replace(/"/g, '""')}"`
            ];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvString);
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `yokan-contacts-${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const exportMenuItems = [
        { text: 'Import Contacts', icon: <UploadIcon />, onClick: () => setIsImportDialogOpen(true) },
        { text: 'Export as JSON', icon: <DownloadIcon />, onClick: handleExportJson },
        { text: 'Export as CSV', icon: <DownloadIcon />, onClick: handleExportCsv },
    ];

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
            if (!groupKey || (!groupKey.match(/[A-Z0-9]/i) && sortBy !== 'company')) {
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
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <FormControl size="small" sx={{ minWidth: 150, mr: 1 }}>
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
                    <Tooltip title="Add Contact">
                        <IconButton
                            aria-label="add contact"
                            onClick={handleAdd}
                            color="inherit"
                        >
                            <AddIcon />
                        </IconButton>
                    </Tooltip>
                    <SettingsMenu menuItems={exportMenuItems} />
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
                                deleteTooltip={contact.usageCount > 0 ? "This contact is referenced by one or more boards and cannot be undone." : ""}
                                useKababMenu={true}
                            />
                        ))}
                    </Box>
                ))}
                {contacts.length === 0 && (
                     <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
                         No contacts found. Click the "+" button to create one.
                     </Typography>
                )}
            </Box>

            <ContactEditDialog
                open={isEditDialogOpen}
                contact={editingContact}
                onClose={handleCloseEdit}
                onSave={handleSaveEdit}
            />

            <ImportContactsDialog
                open={isImportDialogOpen}
                onClose={() => setIsImportDialogOpen(false)}
                onImportComplete={fetchContacts}
            />
        </Box>
    );
}

export default ContactsSettings;
