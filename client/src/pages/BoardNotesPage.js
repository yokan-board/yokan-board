import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Divider } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { useBlocker } from 'react-router-dom';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import BookmarkItem from '../components/BookmarkItem';
import NewBookmarkForm from '../components/NewBookmarkForm';
import ContactCard from '../components/ContactCard';
import NewContactForm from '../components/NewContactForm';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import contactService from '../services/contactService';

function SortableContactCard({ contact, onUpdate, onDelete }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: contact.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <ContactCard
                contact={contact}
                onUpdate={onUpdate}
                onDelete={onDelete}
                dragHandleProps={listeners}
            />
        </div>
    );
}

function BoardNotesPage({ bookmarks: initialBookmarks = [], contactIds: initialContactIds = [], onSave, onHasUnsavedChangesChange }) {
    const [localBookmarks, setLocalBookmarks] = useState(initialBookmarks);
    const [localContactIds, setLocalContactIds] = useState(initialContactIds);
    const [allContacts, setAllContacts] = useState([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteType, setDeleteType] = useState(null); // 'bookmark' or 'contact'
    const [activeContactId, setActiveContactId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const fetchAllContacts = async () => {
        try {
            const fetchedContacts = await contactService.getContacts();
            setAllContacts(fetchedContacts);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    };

    useEffect(() => {
        fetchAllContacts();
    }, []);

    useEffect(() => {
        setLocalBookmarks(initialBookmarks || []);
        setLocalContactIds(initialContactIds || []);
    }, [initialBookmarks, initialContactIds]);

    const handleDragStart = (event) => {
        setActiveContactId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setLocalContactIds((items) => {
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }

        setActiveContactId(null);
    };

    useEffect(() => {
        const stringifiedLocalBookmarks = JSON.stringify(localBookmarks);
        const stringifiedInitialBookmarks = JSON.stringify(initialBookmarks || []);
        const stringifiedLocalContactIds = JSON.stringify(localContactIds);
        const stringifiedInitialContactIds = JSON.stringify(initialContactIds || []);
        
        const bookmarksChanged = stringifiedLocalBookmarks !== stringifiedInitialBookmarks;
        const contactsChanged = stringifiedLocalContactIds !== stringifiedInitialContactIds;
        
        const newHasUnsavedChanges = bookmarksChanged || contactsChanged;
        setHasUnsavedChanges(newHasUnsavedChanges);
        if (onHasUnsavedChangesChange) {
            onHasUnsavedChangesChange(newHasUnsavedChanges);
        }
    }, [localBookmarks, initialBookmarks, localContactIds, initialContactIds, onHasUnsavedChangesChange]);

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
        onSave({ bookmarks: localBookmarks, contactIds: localContactIds });
    };

    const handleClearChanges = () => {
        setLocalBookmarks(initialBookmarks || []);
        setLocalContactIds(initialContactIds || []);
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
            const savedContact = await contactService.createContact(newContact);
            setAllContacts(prev => [...prev, savedContact]);
            setLocalContactIds(prev => [...prev, savedContact.id]);
        } catch (error) {
            // Check if it's a conflict (email exists)
            if (error.response?.status === 409) {
                 // The NewContactForm handles existing contacts via search, 
                 // but if they hit save on a new one that exists, we should probably 
                 // just find it and add it.
                 console.log('Contact exists, trying to link...');
                 const results = await contactService.searchContacts(newContact.email);
                 const existing = results.find(r => r.email === newContact.email);
                 if (existing) {
                     if (!localContactIds.includes(existing.id)) {
                        setLocalContactIds(prev => [...prev, existing.id]);
                     }
                 }
            } else {
                console.error('Error creating contact:', error);
                alert(error.response?.data?.message || 'Failed to create contact.');
            }
        }
    };

    const handleUpdateContact = async (updatedContact) => {
        try {
            await contactService.updateContact(updatedContact.id, updatedContact);
            setAllContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
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
            // Only remove from local board view, don't delete from global database
            setLocalContactIds(prev => prev.filter(id => id !== itemToDelete));
        }
        setIsDeleteConfirmOpen(false);
        setItemToDelete(null);
        setDeleteType(null);
    };

    const displayContacts = localContactIds
        .map(id => allContacts.find(c => c.id === id))
        .filter(Boolean);

    return (
        <Box sx={{ p: 3 }}>
            {/* Contacts Section */}
            <Typography variant="h5" sx={{ mb: 2 }}>
                Contacts
            </Typography>
            <Box sx={{ mb: 4 }}>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={localContactIds} strategy={rectSortingStrategy}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '16px', mb: 2 }}>
                            {displayContacts.map((contact) => (
                                <SortableContactCard
                                    key={contact.id}
                                    contact={contact}
                                    onUpdate={handleUpdateContact}
                                    onDelete={handleDeleteContact}
                                />
                            ))}
                        </Box>
                    </SortableContext>
                    <DragOverlay>
                        {activeContactId ? (
                            <ContactCard
                                contact={allContacts.find((c) => c.id === activeContactId)}
                                onUpdate={() => {}}
                                onDelete={() => {}}
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>
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

            <Divider sx={{ mt: 4, mb: 2 }} />

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
