import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Divider } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { useBlocker } from 'react-router-dom';
import BookmarkItem from '../components/BookmarkItem';
import NewBookmarkForm from '../components/NewBookmarkForm';
import ContactCard from '../components/ContactCard';
import NewContactForm from '../components/NewContactForm';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import contactService from '../services/contactService';

function BoardNotesPage({ bookmarks: initialBookmarks = [], onSave, onHasUnsavedChangesChange }) {
    const [localBookmarks, setLocalBookmarks] = useState(initialBookmarks);
    const [contacts, setContacts] = useState([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteType, setDeleteType] = useState(null); // 'bookmark' or 'contact'

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

    useEffect(() => {
        setLocalBookmarks(initialBookmarks || []);
    }, [initialBookmarks]);

    useEffect(() => {
        const stringifiedLocalBookmarks = JSON.stringify(localBookmarks);
        const stringifiedInitialBookmarks = JSON.stringify(initialBookmarks || []);
        
        const bookmarksChanged = stringifiedLocalBookmarks !== stringifiedInitialBookmarks;
        
        setHasUnsavedChanges(bookmarksChanged);
        if (onHasUnsavedChangesChange) {
            onHasUnsavedChangesChange(bookmarksChanged);
        }
    }, [localBookmarks, initialBookmarks, onHasUnsavedChangesChange]);

    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) => hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
    );

    useEffect(() => {
        if (blocker.state === 'blocked') {
            if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                blocker.proceed();
            } else {
                blocker.reset();
            }
        }
    }, [blocker]);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (hasUnsavedChanges) {
                event.preventDefault();
                event.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [hasUnsavedChanges]);

    const handleSaveChanges = () => {
        onSave({ bookmarks: localBookmarks });
    };

    const handleClearChanges = () => {
        setLocalBookmarks(initialBookmarks || []);
    };

    // Bookmark Handlers
    const handleAddBookmark = (newBookmark) => {
        const bookmarkWithId = { ...newBookmark, id: uuidv4() };
        setLocalBookmarks([...localBookmarks, bookmarkWithId]);
    };

    const handleUpdateBookmark = (updatedBookmark) => {
        const updatedBookmarks = localBookmarks.map((bookmark) =>
            bookmark.id === updatedBookmark.id ? updatedBookmark : bookmark
        );
        setLocalBookmarks(updatedBookmarks);
    };

    const handleDeleteBookmark = (bookmarkId) => {
        setItemToDelete(bookmarkId);
        setDeleteType('bookmark');
        setIsDeleteConfirmOpen(true);
    };

    // Contact Handlers
    const handleAddContact = async (newContact) => {
        try {
            await contactService.createContact(newContact);
            fetchContacts(); // Refresh list
        } catch (error) {
            console.error('Error creating contact:', error);
            alert(error.response?.data?.errors?.[0]?.msg || 'Failed to create contact. The email may already exist.');
        }
    };

    const handleUpdateContact = async (updatedContact) => {
        try {
            await contactService.updateContact(updatedContact.id, updatedContact);
            fetchContacts(); // Refresh list
        } catch (error) {
            console.error('Error updating contact:', error);
        }
    };

    const handleDeleteContact = (contactId) => {
        setItemToDelete(contactId);
        setDeleteType('contact');
        setIsDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (deleteType === 'bookmark') {
            const updatedBookmarks = localBookmarks.filter((bookmark) => bookmark.id !== itemToDelete);
            setLocalBookmarks(updatedBookmarks);
        } else if (deleteType === 'contact') {
            try {
                await contactService.deleteContact(itemToDelete);
                fetchContacts(); // Refresh list
            } catch (error) {
                console.error('Error deleting contact:', error);
            }
        }
        setIsDeleteConfirmOpen(false);
        setItemToDelete(null);
        setDeleteType(null);
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Contacts Section */}
            <Typography variant="h5" sx={{ mb: 2 }}>
                Contacts
            </Typography>
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '16px', mb: 2 }}>
                    {contacts.map((contact) => (
                        <ContactCard
                            key={contact.id}
                            contact={contact}
                            onUpdate={handleUpdateContact}
                            onDelete={handleDeleteContact}
                        />
                    ))}
                </Box>
                <Box sx={{ width: '24rem' }}>
                    <NewContactForm onAdd={handleAddContact} />
                </Box>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Bookmarks Section */}
            <Typography variant="h5" sx={{ mb: 2 }}>
                Bookmarks
            </Typography>

            <Box>
                {localBookmarks.map((bookmark) => (
                    <BookmarkItem
                        key={bookmark.id}
                        bookmark={bookmark}
                        onUpdate={handleUpdateBookmark}
                        onDelete={handleDeleteBookmark}
                    />
                ))}
            </Box>

            <NewBookmarkForm onAdd={handleAddBookmark} />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button onClick={handleClearChanges} disabled={!hasUnsavedChanges}>
                    Clear Changes
                </Button>
                <Button onClick={handleSaveChanges} disabled={!hasUnsavedChanges} variant="contained" sx={{ ml: 1 }}>
                    Save Changes
                </Button>
            </Box>

            <DeleteConfirmationDialog
                open={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                itemName={deleteType || 'item'}
            />
        </Box>
    );
}

export default BoardNotesPage;
