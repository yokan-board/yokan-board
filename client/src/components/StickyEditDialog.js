import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
} from '@mui/material';
import MarkdownEditor from './MarkdownEditor';

const initialStickyState = {
    title: '',
    content: ''
};

function StickyEditDialog({ open, sticky, onClose, onSave }) {
    const [editingSticky, setEditingSticky] = useState(initialStickyState);

    useEffect(() => {
        if (sticky) {
            setEditingSticky({ ...initialStickyState, ...sticky });
        } else {
            setEditingSticky(initialStickyState);
        }
    }, [sticky, open]);

    const handleTitleChange = (e) => {
        setEditingSticky(prev => ({ ...prev, title: e.target.value }));
    };

    const handleContentChange = (content) => {
        setEditingSticky(prev => ({ ...prev, content }));
    };

    const handleSave = () => {
        if (editingSticky.title.trim() || editingSticky.content.trim()) {
            onSave(editingSticky);
        }
    };

    const isEditMode = !!sticky;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>
                {isEditMode ? 'Edit Sticky Note' : 'Add New Sticky Note'}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minHeight: '400px' }}>
                    <TextField
                        label="Title"
                        value={editingSticky.title}
                        onChange={handleTitleChange}
                        fullWidth
                        size="small"
                        autoFocus
                    />
                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <MarkdownEditor 
                            value={editingSticky.content} 
                            onChange={handleContentChange} 
                            placeholder="Write your note here..."
                        />
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button variant="outlined" onClick={onClose}>Cancel</Button>
                <Button 
                    onClick={handleSave} 
                    variant="contained" 
                    disabled={!editingSticky.title.trim() && !editingSticky.content.trim()}
                >
                    {isEditMode ? 'Save Changes' : 'Add Sticky'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default StickyEditDialog;
