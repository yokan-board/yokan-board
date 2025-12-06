import React, { useState, useEffect } from 'react';
import {
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Autocomplete,
    Box,
    Typography,
} from '@mui/material';
import boardService from '../services/boardService';
import { useAuth } from '../contexts/AuthContext';

function EditBoardDialog({ open, onClose, board, onSave }) {
    const { user } = useAuth();
    const [editedBoardName, setEditedBoardName] = useState('');
    const [editedBoardDescription, setEditedBoardDescription] = useState('');
    const [editedBoardCollection, setEditedBoardCollection] = useState(null);
    const [collectionOptions, setCollectionOptions] = useState([]);
    const [orgShortName, setOrgShortName] = useState('');
    const [orgFullName, setOrgFullName] = useState('');
    const [orgUrl, setOrgUrl] = useState('');
    const [orgLogo, setOrgLogo] = useState('');

    useEffect(() => {
        if (board) {
            setEditedBoardName(board.name);
            setEditedBoardDescription(board.data.description || '');
            setEditedBoardCollection(board.collection || null);
            setOrgShortName(board.data.org?.short_name || '');
            setOrgFullName(board.data.org?.full_name || '');
            setOrgUrl(board.data.org?.url || '');
            setOrgLogo(board.data.org?.logo || '');
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
                        updatedOptions.sort();
                    }
                    setCollectionOptions(updatedOptions);
                } catch (error) {
                    console.error('Error fetching unique collections:', error);
                }
            };
            fetchCollections();
        }
    }, [open, user, board]);

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

    const handleSave = () => {
        const collectionToSend = editedBoardCollection === '' ? null : editedBoardCollection;
        const orgData = {
            short_name: orgShortName,
            full_name: orgFullName,
            url: orgUrl,
            logo: orgLogo,
        };

        const updatedData = {
            ...board.data,
            description: editedBoardDescription,
            ...(Object.values(orgData).some((val) => val) && { org: orgData }),
        };

        onSave(board.id, editedBoardName, updatedData, collectionToSend);
        onClose();
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
                    sx={{ mb: 2 }}
                />

                <Box sx={{ mt: 2, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Organization (Optional)
                    </Typography>
                    <TextField
                        margin="dense"
                        label="Short Name"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={orgShortName}
                        onChange={(e) => setOrgShortName(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Full Name"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={orgFullName}
                        onChange={(e) => setOrgFullName(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="URL"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={orgUrl}
                        onChange={(e) => setOrgUrl(e.target.value)}
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
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
            </DialogActions>
        </Dialog>
    );
}

export default EditBoardDialog;
