import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography } from '@mui/material';

function BookmarkItem({ bookmark, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedBookmark, setEditedBookmark] = useState(bookmark);

    useEffect(() => {
        setEditedBookmark(bookmark);
    }, [bookmark]);

    const handleUpdate = () => {
        setIsEditing(false);
        onUpdate(editedBookmark);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleUpdate();
        }
    };

    if (isEditing) {
        return (
            <Box
                onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                        handleUpdate();
                    }
                }}
                sx={{
                    p: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'background.paper',
                    display: 'flex',
                    flexDirection: 'column', // Stack vertically
                    gap: 2,
                }}
            >
                <TextField
                    value={editedBookmark.title}
                    onChange={(e) => setEditedBookmark({ ...editedBookmark, title: e.target.value })}
                    onKeyPress={handleKeyPress}
                    variant="standard"
                    fullWidth
                    autoFocus
                    InputProps={{ disableUnderline: true }}
                />
                <TextField
                    value={editedBookmark.url}
                    onChange={(e) => setEditedBookmark({ ...editedBookmark, url: e.target.value })}
                    onKeyPress={handleKeyPress}
                    variant="standard"
                    fullWidth
                    InputProps={{ disableUnderline: true }}
                />
            </Box>
        );
    }

    return (
        <Box
            onClick={() => setIsEditing(true)}
            sx={{
                p: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                display: 'flex',
                flexDirection: 'column', // Stack vertically
                gap: 0.5,
                cursor: 'pointer',
                '&:hover': {
                    backgroundColor: 'action.hover',
                },
            }}
        >
            <Typography sx={{ flex: 1 }}>{bookmark.title}</Typography>
            <Typography sx={{ flex: 1, color: 'text.secondary' }}>{bookmark.url}</Typography>
        </Box>
    );
}

export default BookmarkItem;
