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
    Autocomplete,
    Box,
    Typography,
} from '@mui/material';
import { createColumnsFromTemplate } from '../services/templateService';
import boardService from '../services/boardService';
import { useAuth } from '../contexts/AuthContext';

function CreateBoardDialog({ open, onClose, onCreateBoard }) {
    const { user } = useAuth();
    const [newBoardName, setNewBoardName] = useState('');
    const [newBoardDescription, setNewBoardDescription] = useState('');
    const [newBoardTemplate, setNewBoardTemplate] = useState('None');
    const [newBoardCollection, setNewBoardCollection] = useState(null);
    const [collectionOptions, setCollectionOptions] = useState([]);
    const [orgShortName, setOrgShortName] = useState('');
    const [orgFullName, setOrgFullName] = useState('');
    const [orgUrl, setOrgUrl] = useState('');
    const [orgLogo, setOrgLogo] = useState('');

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

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setOrgLogo(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const resetForm = () => {
        setNewBoardName('');
        setNewBoardDescription('');
        setNewBoardTemplate('None');
        setNewBoardCollection(null);
        setOrgShortName('');
        setOrgFullName('');
        setOrgUrl('');
        setOrgLogo('');
    };

    const handleCreate = () => {
        if (newBoardName.trim() === '') return;

        const columns = createColumnsFromTemplate(newBoardTemplate);
        const collectionToSend = newBoardCollection === '' ? null : newBoardCollection;

        const orgData = {
            short_name: orgShortName,
            full_name: orgFullName,
            url: orgUrl,
            logo: orgLogo,
        };

        // Only include the org object if at least one of its fields is populated
        const data = {
            columns,
            description: newBoardDescription,
            columnOrder: Object.keys(columns),
            ...(Object.values(orgData).some((val) => val) && { org: orgData }),
        };

        onCreateBoard(newBoardName, data, collectionToSend);
        resetForm();
        onClose();
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Create New Board</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Board Name"
                    type="text"
                    fullWidth
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    sx={{ mb: 3, mt: 1 }}
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
                        <TextField {...params} margin="dense" label="Collection" type="text" fullWidth sx={{ mb: 3 }} />
                    )}
                />
                <TextField
                    margin="dense"
                    label="Description"
                    type="text"
                    fullWidth
                    multiline
                    rows={4}
                    value={newBoardDescription}
                    onChange={(e) => setNewBoardDescription(e.target.value)}
                    sx={{ mb: 3 }}
                />

                <Box sx={{ mt: 1, mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Organization (Optional)
                    </Typography>
                    <TextField
                        margin="dense"
                        label="Short Name"
                        type="text"
                        fullWidth
                        value={orgShortName}
                        onChange={(e) => setOrgShortName(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Full Name"
                        type="text"
                        fullWidth
                        value={orgFullName}
                        onChange={(e) => setOrgFullName(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="URL"
                        type="text"
                        fullWidth
                        value={orgUrl}
                        onChange={(e) => setOrgUrl(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Button variant="contained" component="label">
                            Upload Logo
                            <input type="file" hidden accept="image/png" onChange={handleLogoChange} />
                        </Button>
                        <Button variant="outlined" onClick={() => setOrgLogo('')} disabled={!orgLogo}>
                            Clear Logo
                        </Button>
                    </Box>
                    {orgLogo && (
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <img src={orgLogo} alt="Logo Preview" style={{ maxWidth: '100px', maxHeight: '100px' }} />
                        </Box>
                    )}
                </Box>

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
                </FormControl>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button variant="outlined" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={handleCreate}>
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default CreateBoardDialog;
