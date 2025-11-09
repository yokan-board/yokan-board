import React, { useState, useEffect } from 'react';
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

function EditBoardDialog({ open, onClose, board, onSave }) {
    const [editedBoardName, setEditedBoardName] = useState('');
    const [editedBoardDescription, setEditedBoardDescription] = useState('');

    useEffect(() => {
        if (board) {
            setEditedBoardName(board.name);
            setEditedBoardDescription(board.data.description || '');
        }
    }, [board]);

    const handleSave = () => {
        onSave(board.id, editedBoardName, editedBoardDescription);
        onClose(); // Call onClose after successful save
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Edit Board</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Board Name"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={editedBoardName}
                    onChange={(e) => setEditedBoardName(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <TextField
                    margin="dense"
                    label="Description"
                    type="text"
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    value={editedBoardDescription}
                    onChange={(e) => setEditedBoardDescription(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
            </DialogActions>
        </Dialog>
    );
}

export default EditBoardDialog;
