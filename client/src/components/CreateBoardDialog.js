import React, { useState, useEffect } from 'react';
import {
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Autocomplete, // Import Autocomplete
} from '@mui/material';
import { createColumnsFromTemplate } from '../services/templateService';
import boardService from '../services/boardService'; // Import boardService
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

function CreateBoardDialog({ open, onClose, onCreateBoard }) {
    const { user } = useAuth(); // Get user from useAuth
    const [newBoardName, setNewBoardName] = useState('');
    const [newBoardDescription, setNewBoardDescription] = useState('');
    const [newBoardTemplate, setNewBoardTemplate] = useState('None');
    const [newBoardCollection, setNewBoardCollection] = useState(null); // New state for collection
    const [collectionOptions, setCollectionOptions] = useState([]); // State for autocomplete options

    useEffect(() => {
        if (open && user) {
            const fetchCollections = async () => {
                try {
                    const collections = await boardService.getUniqueCollections(user.id);
                    setCollectionOptions(collections);
                } catch (error) {
                    console.error('Error fetching unique collections:', error);
                }
            };
            fetchCollections();
        }
    }, [open, user]);

    const handleCreate = () => {
        if (newBoardName.trim() === '') return;
        const columns = createColumnsFromTemplate(newBoardTemplate);
        onCreateBoard(newBoardName, newBoardDescription, columns, newBoardCollection); // Pass newBoardCollection
        setNewBoardName('');
        setNewBoardDescription('');
        setNewBoardTemplate('None');
        setNewBoardCollection(null); // Reset collection
        onClose(); // Call onClose after successful creation
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Create New Board</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Board Name"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <Autocomplete
                    freeSolo
                    options={collectionOptions}
                    value={newBoardCollection}
                    onChange={(event, newValue) => {
                        setNewBoardCollection(newValue);
                    }}
                    onInputChange={(event, newInputValue) => {
                        setNewBoardCollection(newInputValue);
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
                    value={newBoardDescription}
                    onChange={(e) => setNewBoardDescription(e.target.value)}
                />
                <FormControl fullWidth margin="dense" sx={{ mt: 2 }}>
                    <InputLabel id="new-board-template-label">Template</InputLabel>
                    <Select
                        labelId="new-board-template-label"
                        id="new-board-template"
                        value={newBoardTemplate}
                        onChange={(e) => setNewBoardTemplate(e.target.value)}
                        label="Template"
                    >
                        <MenuItem value="None">None</MenuItem>
                        <MenuItem value="1 Column">1 Column</MenuItem>
                        <MenuItem value="Standard 3 columns">Standard 3 columns</MenuItem>
                        <MenuItem value="Standard 4 columns">Standard 4 columns</MenuItem>
                        <MenuItem value="Standard 5 columns">Standard 5 columns</MenuItem>
                    </Select>
                </FormControl>{' '}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleCreate}>Create</Button>
            </DialogActions>
        </Dialog>
    );
}

export default CreateBoardDialog;
