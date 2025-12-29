import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
    LinearProgress,
    Alert,
    Divider
} from '@mui/material';
import Papa from 'papaparse';
import contactService from '../services/contactService';

function ImportContactsDialog({ open, onClose, onImportComplete }) {
    const [file, setFile] = useState(null);
    const [strategy, setStrategy] = useState('merge');
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setResult(null);
        setError(null);
        setProgress(0);
    };

    const handleStrategyChange = (e) => {
        setStrategy(e.target.value);
    };

    const resetDialog = () => {
        setFile(null);
        setStrategy('merge');
        setImporting(false);
        setProgress(0);
        setResult(null);
        setError(null);
    };

    const handleClose = () => {
        if (!importing) {
            resetDialog();
            onClose();
        }
    };

    const processImport = async () => {
        if (!file) return;

        setImporting(true);
        setError(null);
        setProgress(10); // Initial progress

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const content = e.target.result;
                let contacts = [];

                if (file.name.endsWith('.json')) {
                    contacts = JSON.parse(content);
                } else if (file.name.endsWith('.csv')) {
                    const parsed = Papa.parse(content, { header: true, skipEmptyLines: true });
                    contacts = parsed.data.map(row => ({
                        name: row.Name || row.name,
                        title: row.Title || row.title,
                        company: row.Company || row.company,
                        email: row.Email || row.email,
                        phone: row.Phone || row.phone,
                        status: row.Status || row.status || 'ACTIVE',
                        avatarUrl: row['Avatar URL'] || row.avatarUrl
                    }));
                } else {
                    throw new Error('Unsupported file format. Please use .json or .csv');
                }

                if (!Array.isArray(contacts)) {
                    throw new Error('Invalid file content. Expected an array of contacts.');
                }

                setProgress(30);

                // Call the bulk import API
                const stats = await contactService.bulkImportContacts(contacts, strategy);
                
                setProgress(100);
                setResult(stats);
                if (onImportComplete) {
                    onImportComplete();
                }
            } catch (err) {
                console.error('Import error:', err);
                setError(err.message || 'Failed to process import file.');
            } finally {
                setImporting(false);
            }
        };

        reader.onerror = () => {
            setError('Failed to read file.');
            setImporting(false);
        };

        reader.readAsText(file);
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>Import Contacts</DialogTitle>
            <DialogContent>
                {!result ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Select a JSON or CSV file to import contacts. You can export your current list to see the expected format.
                        </Typography>

                        <Button variant="outlined" component="label" disabled={importing}>
                            {file ? file.name : 'Choose File'}
                            <input type="file" hidden accept=".json,.csv" onChange={handleFileChange} />
                        </Button>

                        <Divider />

                        <FormControl component="fieldset" disabled={importing}>
                            <FormLabel component="legend" sx={{ mb: 1, fontWeight: 'bold' }}>Conflict Resolution</FormLabel>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                                How should we handle contacts that already exist (matched by email)?
                            </Typography>
                            <RadioGroup value={strategy} onChange={handleStrategyChange}>
                                <FormControlLabel 
                                    value="merge" 
                                    control={<Radio />} 
                                    label={
                                        <Box>
                                            <Typography variant="body2">Merge and update (Default)</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Update existing fields with new values and add any new fields.
                                            </Typography>
                                        </Box>
                                    } 
                                    sx={{ alignItems: 'flex-start', mb: 1 }}
                                />
                                <FormControlLabel 
                                    value="skip" 
                                    control={<Radio />} 
                                    label={
                                        <Box>
                                            <Typography variant="body2">Skip existing</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Do not import records that already exist in your contacts.
                                            </Typography>
                                        </Box>
                                    } 
                                    sx={{ alignItems: 'flex-start', mb: 1 }}
                                />
                                <FormControlLabel 
                                    value="replace" 
                                    control={<Radio />} 
                                    label={
                                        <Box>
                                            <Typography variant="body2">Replace existing</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Completely replace existing records with the data from the file.
                                            </Typography>
                                        </Box>
                                    } 
                                    sx={{ alignItems: 'flex-start' }}
                                />
                            </RadioGroup>
                        </FormControl>

                        {importing && (
                            <Box sx={{ width: '100%', mt: 2 }}>
                                <Typography variant="body2" sx={{ mb: 1 }}>Importing...</Typography>
                                <LinearProgress variant="determinate" value={progress} />
                            </Box>
                        )}

                        {error && (
                            <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
                        )}
                    </Box>
                ) : (
                    <Box sx={{ mt: 1 }}>
                        <Alert severity="success" sx={{ mb: 3 }}>
                            Import completed successfully!
                        </Alert>
                        <Typography variant="h6" gutterBottom>Import Summary</Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                            <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                                <Typography variant="h4" color="primary.main">{result.added}</Typography>
                                <Typography variant="body2" color="text.secondary">New Contacts Added</Typography>
                            </Box>
                            <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                                <Typography variant="h4" color="success.main">{result.merged}</Typography>
                                <Typography variant="body2" color="text.secondary">Contacts Merged</Typography>
                            </Box>
                            <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                                <Typography variant="h4" color="info.main">{result.skipped}</Typography>
                                <Typography variant="body2" color="text.secondary">Contacts Skipped</Typography>
                            </Box>
                            <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                                <Typography variant="h4" color="warning.main">{result.replaced}</Typography>
                                <Typography variant="body2" color="text.secondary">Contacts Replaced</Typography>
                            </Box>
                        </Box>
                        {result.errors > 0 && (
                            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                                {result.errors} records could not be imported due to errors.
                            </Typography>
                        )}
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                {!result ? (
                    <>
                        <Button onClick={handleClose} disabled={importing}>Cancel</Button>
                        <Button 
                            onClick={processImport} 
                            variant="contained" 
                            disabled={!file || importing}
                        >
                            Start Import
                        </Button>
                    </>
                ) : (
                    <Button onClick={handleClose} variant="contained">Close</Button>
                )}
            </DialogActions>
        </Dialog>
    );
}

export default ImportContactsDialog;
