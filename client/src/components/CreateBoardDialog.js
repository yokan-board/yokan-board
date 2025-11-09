import React, { useState } from 'react';
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
} from '@mui/material';
import { createColumnsFromTemplate } from '../services/templateService';

function CreateBoardDialog({ open, onClose, onCreateBoard }) {
    const [newBoardName, setNewBoardName] = useState('');
    const [newBoardDescription, setNewBoardDescription] = useState('');
    const [newBoardTemplate, setNewBoardTemplate] = useState('None');

    const handleCreate = () => {
        if (newBoardName.trim() === '') return;
        const columns = createColumnsFromTemplate(newBoardTemplate);
        onCreateBoard(newBoardName, newBoardDescription, columns);
        setNewBoardName('');
        setNewBoardDescription('');
        setNewBoardTemplate('None');
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
