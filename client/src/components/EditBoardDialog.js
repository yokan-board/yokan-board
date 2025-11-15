import React, { useState, useEffect } from 'react';
import {
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Autocomplete, // Import Autocomplete
} from '@mui/material';
import boardService from '../services/boardService'; // Import boardService
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

function EditBoardDialog({ open, onClose, board, onSave }) {
    const { user } = useAuth(); // Get user from useAuth
    const [editedBoardName, setEditedBoardName] = useState('');
    const [editedBoardDescription, setEditedBoardDescription] = useState('');
    const [editedBoardCollection, setEditedBoardCollection] = useState(null); // New state for collection
    const [collectionOptions, setCollectionOptions] = useState([]); // State for autocomplete options

    useEffect(() => {
        if (board) {
            setEditedBoardName(board.name);
            setEditedBoardDescription(board.data.description || '');
            setEditedBoardCollection(board.collection || null); // Pre-populate collection
        }
    }, [board]);

    useEffect(() => {
        if (open && user) {
            const fetchCollections = async () => {
                try {
                    const collections = await boardService.getUniqueCollections(user.id);
                    let updatedOptions = [...collections];
                    if (board && board.collection && !collections.includes(board.collection)) {
                        updatedOptions.push(board.collection);
                        updatedOptions.sort(); // Keep sorted
                    }
                    setCollectionOptions(updatedOptions);
                } catch (error) {
                    console.error('Error fetching unique collections:', error);
                }
            };
            fetchCollections();
        }
    }, [open, user, board]); // Add board to dependency array to re-run when board changes

    const handleSave = () => {
        onSave(board.id, editedBoardName, editedBoardDescription, editedBoardCollection); // Pass editedBoardCollection
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
                <Autocomplete
                    freeSolo
                    options={collectionOptions}
                    value={editedBoardCollection}
                    onChange={(event, newValue) => {
                        setEditedBoardCollection(newValue);
                    }}
                    onInputChange={(event, newInputValue) => {
                        setEditedBoardCollection(newInputValue);
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            margin="dense"
                            label="Collection"
                            type="text"
                            fullWidth
                            variant="standard"
                            sx={{ mb: 2 }}
                        />
                    )}
                    sx={{ mt: 1, mb: 2 }}
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
