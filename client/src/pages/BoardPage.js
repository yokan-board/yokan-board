/* eslint-disable no-use-before-define */
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
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
    Tab, // Import Tab
} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab'; // Import TabContext, TabList, TabPanel

import DownloadIcon from '@mui/icons-material/Download'; // Import DownloadIcon
import AddIcon from '@mui/icons-material/Add'; // Import AddIcon
import RefreshIcon from '@mui/icons-material/Refresh'; // Import RefreshIcon
import EditIcon from '@mui/icons-material/Edit'; // Import EditIcon
import Board from '../components/Board';
import boardService from '../services/boardService';
import SettingsMenu from '../components/SettingsMenu'; // Import SettingsMenu
import EditBoardDialog from '../components/EditBoardDialog'; // Import EditBoardDialog
import ArchiveHistoryDisplay from '../components/ArchiveHistoryDisplay'; // Import ArchiveHistoryDisplay
import BoardNotesPage from './BoardNotesPage'; // Import BoardNotesPage
import BoardSettingsPage from './BoardSettingsPage'; // Import BoardSettingsPage
import { v4 as uuidv4 } from 'uuid';
import { getRandomColor } from '../services/colorService';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { useBoards } from '../contexts/BoardContext'; // Import useBoards

function BoardPage() {
    const { id } = useParams(); // This is the boardId
    const [initialBoardDataForHook, setInitialBoardDataForHook] = useState(null); // New state for initial data for useBoardData
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
    const [boardCollectionName, setBoardCollectionName] = useState(null); // New state for collection name
    const [selectedTab, setSelectedTab] = useState('board'); // New state for tab selection
    const [currentBoardData, setCurrentBoardData] = useState(null); // New state to hold the latest board data from useBoardData
    const [notesHaveUnsavedChanges, setNotesHaveUnsavedChanges] = useState(false); // New state for unsaved changes in notes

    const tasksMap = useMemo(() => {
        const map = {};
        if (currentBoardData && currentBoardData.columns) {
            Object.values(currentBoardData.columns).forEach((column) => {
                if (column.tasks) {
                    column.tasks.forEach((task) => {
                        map[task.id] = task;
                    });
                }
            });
        }
        return map;
    }, [currentBoardData]);

    const handleTabChange = (event, newValue) => {
        if (notesHaveUnsavedChanges && newValue !== selectedTab) {
            const confirmLeave = window.confirm(
                'You have unsaved changes in Notes. Are you sure you want to leave without saving?'
            );
            if (!confirmLeave) {
                return; // Prevent tab change
            }
        }
        setSelectedTab(newValue);
    };

    const handleBoardDataChange = useCallback((newBoardData) => {
        setCurrentBoardData(newBoardData);
        setInitialBoardDataForHook(newBoardData); // Update initialBoardDataForHook as well
    }, []);

    const fetchBoard = useCallback(
        async (noCache = false) => {
            try {
                setLoading(true);
                const data = await boardService.getBoard(id, noCache);
                if (data) {
                    if (data.data) {
                        if (typeof data.data === 'string') {
                            data.data = JSON.parse(data.data);
                        }
                        if (!data.data.columns || Array.isArray(data.data.columns)) {
                            data.data.columns = {};
                        }
                        if (!data.data.bookmarks || !Array.isArray(data.data.bookmarks)) {
                            data.data.bookmarks = [];
                        }
                        if (!data.data.contactIds || !Array.isArray(data.data.contactIds)) {
                            data.data.contactIds = [];
                        }
                        if (!data.data.contactTags || typeof data.data.contactTags !== 'object') {
                            data.data.contactTags = {};
                        }
                    } else {
                        data.data = { columns: {}, contactTags: {} };
                    }
                    return data; // RETURN THE FETCHED DATA
                } else {
                    setError('Board not found');
                    return null;
                }
            } catch (err) {
                console.error('Error fetching board:', err);
                setError('Failed to load board');
                return null;
            } finally {
                setLoading(false);
            }
        },
        [id]
    );

    const handleArchiveTask = useCallback(async (taskId) => {
        if (boardRef.current && boardRef.current.handleArchiveTask) {
            boardRef.current.handleArchiveTask(taskId);
            // The onSaveBoard in useBoardData will handle persistence
        }
    }, []);

    const handleArchiveColumn = useCallback(async (columnId) => {
        if (boardRef.current && boardRef.current.handleArchiveColumn) {
            boardRef.current.handleArchiveColumn(columnId);
            // The onSaveBoard in useBoardData will handle persistence
        }
    }, []);

    useEffect(() => {
        setSelectedTab('board');
        const loadBoard = async () => {
            const fetchedData = await fetchBoard();
            if (fetchedData) {
                setInitialBoardDataForHook(fetchedData.data); // Pass data.data to useBoardData
                setEditedBoardName(fetchedData.name); // Set initial edited name
                setBoardCollectionName(fetchedData.collection); // Set board collection name
            }
        };
        loadBoard();
    }, [fetchBoard]);

    const handleSaveBoard = useCallback(
        async (updatedBoardData) => {
            try {
                await boardService.updateBoard(id, updatedBoardData.name, updatedBoardData.data);
                fetchBoards(); // Refetch all boards to update sidebar/dashboard
                handleBoardDataChange(updatedBoardData.data);
            } catch (err) {
                console.error('Error saving board:', err);
            }
        },
        [id, fetchBoards, handleBoardDataChange]
    );

    const handleSaveNotes = async ({ bookmarks, contactIds, contactTags }) => {
        const updatedBoardData = {
            ...currentBoardData,
            bookmarks: bookmarks,
            contactIds: contactIds,
            contactTags: contactTags,
        };
        await handleSaveBoard({ name: editedBoardName, data: updatedBoardData });
    };

    const handleSaveBoardName = async () => {
        const currentBoardState = boardRef.current ? boardRef.current.getBoardData() : currentBoardData;
        if (!currentBoardState) return;

        if (editedBoardName.trim() !== '' && editedBoardName !== currentBoardState.name) {
            try {
                await boardService.updateBoard(id, editedBoardName, currentBoardState);
                // setBoardData((prev) => ({ ...prev, name: editedBoardName })); // REMOVE THIS
                fetchBoards(); // Refetch all boards to update sidebar/dashboard
            } catch (err) {
                console.error('Error saving board name:', err);
                setError('Failed to save board name');
            }
        } else {
            setEditedBoardName(currentBoardState.name); // Revert if empty or unchanged
        }
        setIsEditingBoardName(false);
    };

    const handleSaveEditedBoard = async (boardId, newName, newDescription) => {
        try {
            const currentBoardData = boardRef.current ? boardRef.current.getBoardData() : currentBoardData;
            const updatedData = { ...currentBoardData, description: newDescription };
            await boardService.updateBoard(boardId, newName, updatedData);
            // Refresh the board data to show the new name and description
            // fetchBoard(true); // REMOVE THIS
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

    const handleAddColumn = useCallback(async () => {
        if (newColumnTitle.trim() === '') return;

        // Save any pending changes from the Board component first
        let latestBoardData = boardRef.current ? boardRef.current.getBoardData() : currentBoardData; // Use currentBoardData from useBoardData
        if (!latestBoardData) return;

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
            await boardService.updateBoard(id, editedBoardName, updatedBoardData); // Use editedBoardName for board name
            fetchBoards(); // Refetch all boards to update sidebar/dashboard
            handleBoardDataChange(updatedBoardData);
            // The useBoardData hook will update its internal state and propagate via onBoardDataChange
            setNewColumnTitle('');
            setOpenAddColumnDialog(false);
        } catch (err) {
            console.error('Error adding column:', err);
            setError('Failed to add column');
        }
    }, [newColumnTitle, currentBoardData, editedBoardName, id, fetchBoards, handleBoardDataChange]);

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

    const handleExportMarkdown = async () => {
        try {
            let boardToExport = boardRef.current ? boardRef.current.getBoardData() : currentBoardData;
            if (!boardToExport) return;

            // Resolve contactIds to actual contact data
            const contactService = (await import('../services/contactService')).default;
            const allContacts = await contactService.getContacts();
            const resolvedContacts = (boardToExport.contactIds || []).map(id => allContacts.find(c => c.id === id)).filter(Boolean);
            
            const boardWithResolvedContacts = {
                ...boardToExport,
                contacts: resolvedContacts
            };

            const boardDescription = boardToExport.description;
            boardService.exportBoardMarkdown(editedBoardName, boardDescription, boardWithResolvedContacts); // Use editedBoardName
            console.log('Markdown export initiated.');
        } catch (err) {
            console.error('Error exporting Markdown:', err);
        }
    };

    const handleRefresh = async () => {
        setSelectedTab('board'); // Reset to board view to ensure Board component is mounted
        const fetchedData = await fetchBoard(true); // Pass true to bypass cache
        if (fetchedData) {
            setInitialBoardDataForHook(fetchedData.data); // Update the state that initializes the Board component
            setEditedBoardName(fetchedData.name); // Update edited name as well
        }
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

    if (!initialBoardDataForHook) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="info">Board data is empty.</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box> {/* New Box to ensure vertical stacking of titles */}
                    <Typography variant="h6" color="textSecondary" sx={{ mb: 0.5 }}>
                        {boardCollectionName === 'Default' || !boardCollectionName ? 'Boards' : boardCollectionName}
                    </Typography>
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
                            onClick={() => setIsEditingBoardName(true)}
                            sx={{ cursor: 'pointer' }}
                        >
                            {editedBoardName}
                        </Typography>
                    )}
                </Box>
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

            <TabContext value={selectedTab}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex' }}>
                    <TabList onChange={handleTabChange} aria-label="board tabs" sx={{ flexGrow: 1 }}>
                        <Tab label="Board" value="board" />
                        <Tab label="Notes" value="notes" />
                        <Tab label="Archive" value="archive" />
                        <Tab
                            label="Settings"
                            value="settings"
                            sx={{
                                marginLeft: 'auto',
                                '&.Mui-selected': {
                                    color: 'primary.main',
                                },
                            }}
                        />
                    </TabList>
                </Box>
                <TabPanel value="board" sx={{ p: 0 }}>
                    {initialBoardDataForHook && (
                        <Board
                            ref={boardRef}
                            initialBoardData={initialBoardDataForHook}
                            boardName={editedBoardName} // Use editedBoardName
                            boardId={id}
                            onSaveBoard={handleSaveBoard}
                            onArchiveColumn={handleArchiveColumn}
                            onArchiveTask={handleArchiveTask}
                            onBoardDataChange={handleBoardDataChange}
                        />
                    )}
                </TabPanel>
                <TabPanel value="notes" sx={{ p: 0 }}>
                    {currentBoardData && (
                        <BoardNotesPage
                            bookmarks={currentBoardData.bookmarks}
                            contactIds={currentBoardData.contactIds || []}
                            contactTags={currentBoardData.contactTags || {}}
                            onSave={handleSaveNotes}
                            onHasUnsavedChangesChange={setNotesHaveUnsavedChanges}
                        />
                    )}
                </TabPanel>
                <TabPanel value="archive" sx={{ p: 0 }}>
                    {currentBoardData && (
                        <ArchiveHistoryDisplay archiveHistory={currentBoardData.archiveHistory} tasksMap={tasksMap} />
                    )}
                </TabPanel>
                <TabPanel value="settings" sx={{ p: 0 }}>
                    {currentBoardData && (
                        <BoardSettingsPage
                            boardData={currentBoardData}
                            onSaveBoard={(updatedData) => handleSaveBoard({ name: editedBoardName, data: updatedData })}
                        />
                    )}
                </TabPanel>
            </TabContext>

            {initialBoardDataForHook && (
                <EditBoardDialog
                    open={openEditDialog}
                    onClose={() => setOpenEditDialog(false)}
                    board={{ name: editedBoardName, data: initialBoardDataForHook }} // Pass name and data separately
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
