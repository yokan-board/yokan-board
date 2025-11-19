import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function BookmarkItem({ bookmark, onUpdate, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
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

    const handleDelete = (e) => {
        e.stopPropagation(); // Prevent the click from triggering setIsEditing
        onDelete(bookmark.id);
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
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            sx={{
                p: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                cursor: 'pointer',
                '&:hover': {
                    backgroundColor: 'action.hover',
                },
            }}
        >
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography>{bookmark.title}</Typography>
                <Typography color="text.secondary">{bookmark.url}</Typography>
            </Box>
            {isHovered && (
                <IconButton onClick={handleDelete} size="small">
                    <DeleteIcon fontSize="small" />
                </IconButton>
            )}
        </Box>
    );
}

export default BookmarkItem;
