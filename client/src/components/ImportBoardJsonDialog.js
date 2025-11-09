import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';

function ImportBoardJsonDialog({ open, onClose, onImport }) {
    const [jsonFileContent, setJsonFileContent] = useState(null);

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
            onImport(jsonFileContent);
            setJsonFileContent(null);
            onClose(); // Call onClose after successful import
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Import Board from JSON</DialogTitle>
            <DialogContent>
                <Button variant="contained" component="label">
                    Upload JSON File
                    <input type="file" hidden accept=".json" onChange={handleJsonFileChange} />
                </Button>
                {jsonFileContent && <Typography sx={{ mt: 2 }}>File selected.</Typography>}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleConfirmImport} disabled={!jsonFileContent}>
                    Import
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ImportBoardJsonDialog;
