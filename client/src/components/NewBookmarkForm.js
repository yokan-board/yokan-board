import React, { useState, useRef } from 'react';
import { Box, TextField } from '@mui/material';

function NewBookmarkForm({ onAdd }) {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const urlInputRef = useRef(null);

    const handleUrlKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (url.trim() !== '') {
                onAdd({ title: title.trim(), url: url.trim() });
                setTitle('');
                setUrl('');
            }
        }
    };

    const handleTitleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (urlInputRef.current) {
                urlInputRef.current.focus();
            }
        }
    };

    return (
        <Box
            component="form"
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
                name="title"
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyPress={handleTitleKeyPress}
                variant="standard"
                fullWidth
                InputProps={{ disableUnderline: true }}
            />
            <TextField
                name="url"
                label="URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={handleUrlKeyPress}
                variant="standard"
                fullWidth
                inputRef={urlInputRef}
                InputProps={{ disableUnderline: true }}
            />
        </Box>
    );
}

export default NewBookmarkForm;
