import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Button, Divider, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { useBlocker } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
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
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import contactService from '../services/contactService';
import ContactEditDialog from '../components/ContactEditDialog';
import { useBoards } from '../contexts/BoardContext';

function SortableContactCard({ contact, onEdit, onDelete, dragHandleProps, viewMode, tags, useKababMenu = true }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: contact.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        width: viewMode === 'list' ? '100%' : 'auto',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <ContactCard
                contact={contact}
                onEdit={onEdit}
                onDelete={onDelete}
                dragHandleProps={listeners}
                viewMode={viewMode}
                tags={tags}
                useKababMenu={useKababMenu}
            />
        </div>
    );
}

function BoardNotesPage({ bookmarks: initialBookmarks = [], contactIds: initialContactIds = [], contactTags: initialContactTags = {}, onSave, onHasUnsavedChangesChange }) {
    const { boards } = useBoards();
    const [localBookmarks, setLocalBookmarks] = useState(initialBookmarks);
    const [localContactIds, setLocalContactIds] = useState(initialContactIds);
    const [localContactTags, setLocalContactTags] = useState(initialContactTags);
    const [allContacts, setAllContacts] = useState([]);

    // Extract all unique tags across all boards
    const availableTags = useMemo(() => {
        const tagSet = new Set();
        boards.forEach(board => {
            if (board.data && board.data.contactTags) {
                Object.values(board.data.contactTags).forEach(tags => {
                    if (Array.isArray(tags)) {
                        tags.forEach(tag => tagSet.add(tag));
                    }
                });
            }
        });
        // Also include tags from current unsaved state
        Object.values(localContactTags).forEach(tags => {
            if (Array.isArray(tags)) {
                tags.forEach(tag => tagSet.add(tag));
            }
        });
        return Array.from(tagSet).sort();
    }, [boards, localContactTags]);

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteType, setDeleteType] = useState(null); // 'bookmark' or 'contact'
    const [activeContactId, setActiveContactId] = useState(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem('boardNotesContactViewMode') || 'card';
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleViewModeChange = (event, newViewMode) => {
        if (newViewMode !== null) {
            setViewMode(newViewMode);
            localStorage.setItem('boardNotesContactViewMode', newViewMode);
        }
    };

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
        setLocalContactTags(initialContactTags || {});
    }, [initialBookmarks, initialContactIds, initialContactTags]);

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
        const stringifiedLocalContactTags = JSON.stringify(localContactTags);
        const stringifiedInitialContactTags = JSON.stringify(initialContactTags || {});
        
        const bookmarksChanged = stringifiedLocalBookmarks !== stringifiedInitialBookmarks;
        const contactsChanged = stringifiedLocalContactIds !== stringifiedInitialContactIds;
        const tagsChanged = stringifiedLocalContactTags !== stringifiedInitialContactTags;
        
        const newHasUnsavedChanges = bookmarksChanged || contactsChanged || tagsChanged;
        setHasUnsavedChanges(newHasUnsavedChanges);
        if (onHasUnsavedChangesChange) {
            onHasUnsavedChangesChange(newHasUnsavedChanges);
        }
    }, [localBookmarks, initialBookmarks, localContactIds, initialContactIds, localContactTags, initialContactTags, onHasUnsavedChangesChange]);

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
        onSave({ bookmarks: localBookmarks, contactIds: localContactIds, contactTags: localContactTags });
    };

    const handleClearChanges = () => {
        setLocalBookmarks(initialBookmarks || []);
        setLocalContactIds(initialContactIds || []);
        setLocalContactTags(initialContactTags || {});
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
    const handleOpenEdit = (contact = null) => {
        if (contact) {
            setEditingContact({
                ...contact,
                tags: localContactTags[contact.id] || []
            });
        } else {
            setEditingContact(null);
        }
        setIsEditDialogOpen(true);
    };

    const handleCloseEdit = () => {
        setIsEditDialogOpen(false);
        setEditingContact(null);
    };

    const handleSaveEdit = async (contact) => {
        try {
            const { tags, ...contactData } = contact;
            let savedContact;
            if (contact.id) {
                // Update existing
                await contactService.updateContact(contact.id, contactData);
                setAllContacts(prev => prev.map(c => c.id === contact.id ? { ...c, ...contactData } : c));
                savedContact = { ...contactData, id: contact.id };
                if (!localContactIds.includes(contact.id)) {
                    setLocalContactIds(prev => [...prev, contact.id]);
                }
            } else {
                // Create new
                savedContact = await contactService.createContact(contactData);
                setAllContacts(prev => [...prev, savedContact]);
                setLocalContactIds(prev => [...prev, savedContact.id]);
            }
            
            // Save tags locally for this board
            setLocalContactTags(prev => ({
                ...prev,
                [savedContact.id]: tags || []
            }));

            handleCloseEdit();
        } catch (error) {
            console.error('Error saving contact:', error);
            alert(error.response?.data?.message || 'Failed to save contact.');
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">
                    Contacts
                </Typography>
                <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={handleViewModeChange}
                    aria-label="contact view mode"
                    size="small"
                >
                    <ToggleButton value="card" aria-label="card view">
                        <ViewModuleIcon />
                    </ToggleButton>
                    <ToggleButton value="list" aria-label="list view">
                        <ViewListIcon />
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>
            <Box sx={{ mb: 4 }}>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext 
                        items={localContactIds} 
                        strategy={rectSortingStrategy}
                    >
                        <Box sx={{ 
                            display: viewMode === 'list' ? 'grid' : 'flex',
                            gridTemplateColumns: viewMode === 'list' ? { xs: '1fr', xl: '1fr 1fr' } : undefined,
                            flexWrap: viewMode === 'list' ? undefined : 'wrap',
                            flexDirection: viewMode === 'list' ? undefined : 'row',
                            gap: '16px', 
                            mb: 2 
                        }}>
                            {displayContacts.map((contact) => (
                                <SortableContactCard
                                    key={contact.id}
                                    contact={contact}
                                    onEdit={handleOpenEdit}
                                    onDelete={handleDeleteContact}
                                    viewMode={viewMode}
                                    tags={localContactTags[contact.id] || []}
                                />
                            ))}
                        </Box>
                    </SortableContext>
                    <DragOverlay>
                        {activeContactId ? (
                            <ContactCard
                                contact={allContacts.find((c) => c.id === activeContactId)}
                                onEdit={() => {}}
                                onDelete={() => {}}
                                viewMode={viewMode}
                                tags={localContactTags[activeContactId] || []}
                                useKababMenu={true}
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>
                <Box sx={{ width: viewMode === 'list' ? '100%' : '24rem', mt: 2 }}>
                    <Button
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenEdit()}
                        variant="outlined"
                        fullWidth
                    >
                        Add New Contact
                    </Button>
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
                title={deleteType === 'contact' ? 'Remove Contact Reference' : 'Confirm Deletion'}
                message={
                    deleteType === 'contact'
                        ? 'Are you sure you want to remove the reference to this contact from this board? This action is not reversible.'
                        : 'Are you sure you want to delete this bookmark? This action is not reversible.'
                }
                confirmButtonText={deleteType === 'contact' ? 'Remove' : 'Delete'}
            />

            <ContactEditDialog
                open={isEditDialogOpen}
                contact={editingContact}
                onClose={handleCloseEdit}
                onSave={handleSaveEdit}
                availableTags={availableTags}
            />
        </Box>
    );
}

export default BoardNotesPage;
