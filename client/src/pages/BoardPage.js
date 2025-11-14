import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    CircularProgress,
    Alert,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';

import DownloadIcon from '@mui/icons-material/Download'; // Import DownloadIcon
import AddIcon from '@mui/icons-material/Add'; // Import AddIcon
import RefreshIcon from '@mui/icons-material/Refresh'; // Import RefreshIcon
import EditIcon from '@mui/icons-material/Edit'; // Import EditIcon
import Board from '../components/Board';
import boardService from '../services/boardService';
import SettingsMenu from '../components/SettingsMenu'; // Import SettingsMenu
import EditBoardDialog from '../components/EditBoardDialog'; // Import EditBoardDialog
import { v4 as uuidv4 } from 'uuid';
import { getRandomColor } from '../services/colorService';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { useBoards } from '../contexts/BoardContext'; // Import useBoards

function BoardPage() {
    const { id } = useParams(); // This is the boardId
    const [boardData, setBoardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openAddColumnDialog, setOpenAddColumnDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false); // State for edit dialog
    const [newColumnTitle, setNewColumnTitle] = useState('');
    const { user } = useAuth(); // Get user from useAuth
    const { fetchBoards } = useBoards(); // Get fetchBoards from context
    const boardRef = useRef(); // Create a ref for the Board component

    // New state for inline editing board name
    const [isEditingBoardName, setIsEditingBoardName] = useState(false);
    const [editedBoardName, setEditedBoardName] = useState('');

    const fetchBoard = useCallback(
        async (noCache = false) => {
            try {
                setLoading(true);
                const data = await boardService.getBoard(id, noCache);
                if (data) {
                    // Ensure data.data is an object, parse if it's a string
                    if (data.data) {
                        if (typeof data.data === 'string') {
                            data.data = JSON.parse(data.data);
                        }
                        // Ensure columns is an object, even if it's an empty array from old data
                        // or if it doesn't exist at all.
                        if (!data.data.columns || Array.isArray(data.data.columns)) {
                            data.data.columns = {};
                        }
                    } else {
                        data.data = { columns: {} }; // Default to an object with empty columns if data.data is null/undefined
                    }
                    setBoardData(data);
                } else {
                    setError('Board not found');
                }
            } catch (err) {
                console.error('Error fetching board:', err);
                setError('Failed to load board');
            } finally {
                setLoading(false);
            }
        },
        [id]
    );

    useEffect(() => {
        fetchBoard();
    }, [fetchBoard]);

    useEffect(() => {
        if (boardData) {
            setEditedBoardName(boardData.name);
        }
    }, [boardData]);

    const handleSaveBoard = useCallback(
        async (updatedBoardData) => {
            try {
                await boardService.updateBoard(id, updatedBoardData.name, updatedBoardData.data);
                fetchBoards(); // Refetch all boards to update sidebar/dashboard
            } catch (err) {
                console.error('Error saving board:', err);
            }
        },
        [id, fetchBoards]
    );

    const handleSaveBoardName = async () => {
        if (editedBoardName.trim() !== '' && editedBoardName !== boardData.name) {
            try {
                await boardService.updateBoard(id, editedBoardName, boardData.data);
                setBoardData((prev) => ({ ...prev, name: editedBoardName }));
                fetchBoards(); // Refetch all boards to update sidebar/dashboard
            } catch (err) {
                console.error('Error saving board name:', err);
                setError('Failed to save board name');
            }
        } else {
            setEditedBoardName(boardData.name); // Revert if empty or unchanged
        }
        setIsEditingBoardName(false);
    };

    const handleSaveEditedBoard = async (boardId, newName, newDescription) => {
        try {
            const currentBoardData = boardRef.current ? boardRef.current.getBoardData() : boardData.data;
            const updatedData = { ...currentBoardData, description: newDescription };
            await boardService.updateBoard(boardId, newName, updatedData);
            // Refresh the board data to show the new name and description
            fetchBoard(true); // Use noCache to get fresh data
            fetchBoards(); // Refetch all boards to update sidebar/dashboard
            setOpenEditDialog(false);
        } catch (err) {
            console.error('Error saving board properties:', err);
            setError('Failed to save board properties');
        }
    };

    const handleBoardNameKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSaveBoardName();
        }
    };

    const handleAddColumn = async () => {
        if (newColumnTitle.trim() === '') return;

        // Save any pending changes from the Board component first
        let latestBoardData = boardData.data; // Initialize with current page state
        if (boardRef.current && boardRef.current.getBoardData) {
            const currentBoardState = boardRef.current.getBoardData();
            await handleSaveBoard({ name: boardData.name, data: currentBoardState });
            latestBoardData = currentBoardState; // Use the saved state for further modifications
        }

        const newColumnId = uuidv4();
        const existingColors = Object.values(latestBoardData.columns).map((col) => col.highlightColor);
        let newHighlightColor = getRandomColor();
        while (existingColors.includes(newHighlightColor)) {
            newHighlightColor = getRandomColor();
        }

        const updatedBoardData = {
            ...latestBoardData,
            columns: {
                ...latestBoardData.columns,
                [newColumnId]: {
                    id: newColumnId,
                    title: newColumnTitle,
                    tasks: [],
                    highlightColor: newHighlightColor,
                },
            },
            columnOrder: [...(latestBoardData.columnOrder || []), newColumnId],
        };

        try {
            await boardService.updateBoard(id, boardData.name, updatedBoardData);
            setBoardData((prev) => ({ ...prev, data: updatedBoardData }));
            setNewColumnTitle('');
            setOpenAddColumnDialog(false);
        } catch (err) {
            console.error('Error adding column:', err);
            setError('Failed to add column');
        }
    };

    const handleExportJson = async () => {
        try {
            // Call boardService to export JSON
            await boardService.exportBoardJson(id, user.id);
            // Provide user feedback (e.g., SnackBar)
            console.log('JSON export initiated.');
        } catch (err) {
            console.error('Error exporting JSON:', err);
            // Provide user feedback (e.g., SnackBar)
        }
    };

    const handleExportCsv = async () => {
        try {
            // Call boardService to export CSV
            await boardService.exportBoardCsv(id, user.id);
            // Provide user feedback (e.g., SnackBar)
            console.log('CSV export initiated.');
        } catch (err) {
            console.error('Error exporting CSV:', err);
            // Provide user feedback (e.g., SnackBar)
        }
    };

    const handleExportMarkdown = () => {
        try {
            let boardToExport = boardData.data;
            if (boardRef.current && boardRef.current.getBoardData) {
                boardToExport = boardRef.current.getBoardData();
            }
            const boardDescription = boardToExport.description;
            boardService.exportBoardMarkdown(boardData.name, boardDescription, boardToExport);
            console.log('Markdown export initiated.');
        } catch (err) {
            console.error('Error exporting Markdown:', err);
        }
    };

    const handleRefresh = () => {
        fetchBoard(true); // Pass true to bypass cache
    };

    const settingsMenuItems = [
        { text: 'Edit Properties', icon: <EditIcon />, onClick: () => setOpenEditDialog(true) },
        { text: 'Export to JSON', icon: <DownloadIcon />, onClick: handleExportJson },
        { text: 'Export to CSV', icon: <DownloadIcon />, onClick: handleExportCsv },
        { text: 'Export to Markdown', icon: <DownloadIcon />, onClick: handleExportMarkdown },
    ];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!boardData) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="info">Board data is empty.</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                {isEditingBoardName ? (
                    <TextField
                        value={editedBoardName}
                        onChange={(e) => setEditedBoardName(e.target.value)}
                        onBlur={handleSaveBoardName}
                        onKeyPress={handleBoardNameKeyPress}
                        variant="standard"
                        fullWidth
                        autoFocus
                        InputProps={{
                            disableUnderline: true,
                        }}
                        sx={{
                            '& .MuiInputBase-input': {
                                padding: '4px 0',
                                fontSize: '2.125rem',
                                lineHeight: 1.235,
                            },
                            '& .MuiInputBase-root': {
                                marginTop: 0,
                                marginBottom: 0,
                            },
                        }}
                    />
                ) : (
                    <Typography
                        variant="h4"
                        gutterBottom
                        onClick={() => setIsEditingBoardName(true)}
                        sx={{ cursor: 'pointer' }}
                    >
                        {editedBoardName}
                    </Typography>
                )}
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Refresh board">
                        <IconButton aria-label="refresh board" onClick={handleRefresh} color="inherit">
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Add a column">
                        <IconButton
                            aria-label="add column"
                            onClick={() => setOpenAddColumnDialog(true)}
                            color="inherit"
                        >
                            <AddIcon />
                        </IconButton>
                    </Tooltip>
                    <SettingsMenu menuItems={settingsMenuItems} />
                </Box>
            </Box>
            {boardData && boardData.data && (
                <Board
                    ref={boardRef}
                    initialBoardData={boardData.data}
                    boardName={boardData.name}
                    boardId={id}
                    onSaveBoard={handleSaveBoard}
                />
            )}

            {boardData && (
                <EditBoardDialog
                    open={openEditDialog}
                    onClose={() => setOpenEditDialog(false)}
                    board={boardData}
                    onSave={handleSaveEditedBoard}
                />
            )}

            <Dialog open={openAddColumnDialog} onClose={() => setOpenAddColumnDialog(false)}>
                <DialogTitle>Add New Column</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Column Title"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={newColumnTitle}
                        onChange={(e) => setNewColumnTitle(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddColumnDialog(false)}>Cancel</Button>
                    <Button onClick={handleAddColumn}>Add</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default BoardPage;
