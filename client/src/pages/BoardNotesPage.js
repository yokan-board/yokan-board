import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { useBlocker } from 'react-router-dom';
import BookmarkItem from '../components/BookmarkItem';
import NewBookmarkForm from '../components/NewBookmarkForm';

function BoardNotesPage({ bookmarks: initialBookmarks, onSave }) {
    const [localBookmarks, setLocalBookmarks] = useState(initialBookmarks);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        setLocalBookmarks(initialBookmarks);
    }, [initialBookmarks]);

    useEffect(() => {
        const stringifiedLocal = JSON.stringify(localBookmarks);
        const stringifiedInitial = JSON.stringify(initialBookmarks);
        setHasUnsavedChanges(stringifiedLocal !== stringifiedInitial);
    }, [localBookmarks, initialBookmarks]);

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
                // Chrome requires returnValue to be set
                event.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [hasUnsavedChanges]);

    const handleSaveChanges = () => {
        onSave(localBookmarks);
    };

    const handleClearChanges = () => {
        setLocalBookmarks(initialBookmarks);
    };

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

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
                Bookmarks
            </Typography>

            <Box>
                {localBookmarks.map((bookmark) => (
                    <BookmarkItem key={bookmark.id} bookmark={bookmark} onUpdate={handleUpdateBookmark} />
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
        </Box>
    );
}

export default BoardNotesPage;
