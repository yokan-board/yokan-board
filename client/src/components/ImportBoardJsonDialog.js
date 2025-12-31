import React, { useState, useEffect } from 'react';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    TextField, // Add TextField
    Autocomplete, // Add Autocomplete
} from '@mui/material';
import boardService from '../services/boardService'; // Add boardService
import { useAuth } from '../contexts/AuthContext'; // Add useAuth

function ImportBoardJsonDialog({ open, onClose, onImport }) {
    const { user } = useAuth(); // Add this
    const [jsonFileContent, setJsonFileContent] = useState(null);
    const [newBoardCollection, setNewBoardCollection] = useState('Imported Boards'); // New state for collection
    const [collectionOptions, setCollectionOptions] = useState([]); // State for autocomplete options

    // Add useEffect to fetch collections
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
        if (open) {
            setNewBoardCollection('Imported Boards'); // Reset to default when dialog opens
        }
    }, [open, user]);

    const handleJsonFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = JSON.parse(e.target.result);
                    setJsonFileContent(content);
                } catch (error) {
                    console.error('Error parsing JSON file:', error);
                    // Handle JSON parsing error (e.g., show a snackbar)
                }
            };
            reader.readAsText(file);
        }
    };

    const handleConfirmImport = () => {
        if (jsonFileContent) {
            // Pass collection to onImport
            onImport(jsonFileContent, newBoardCollection);
            setJsonFileContent(null);
            setNewBoardCollection('Imported Boards'); // Reset collection to default after import
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Import Board from JSON</DialogTitle>
            <DialogContent>
                <Button variant="contained" component="label" sx={{ mt: 1 }}>
                    Upload JSON File
                    <input type="file" hidden accept=".json" onChange={handleJsonFileChange} />
                </Button>
                {jsonFileContent && <Typography sx={{ mt: 2, fontWeight: 'bold' }}>File selected.</Typography>}
                {/* Add Autocomplete here */}
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
                            sx={{ mt: 3, mb: 1 }} // Added margin top to separate from file selected text
                        />
                    )}
                />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button variant="outlined" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={handleConfirmImport} disabled={!jsonFileContent}>
                    Import
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ImportBoardJsonDialog;
