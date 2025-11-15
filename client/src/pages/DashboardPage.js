import React, { useState, useMemo } from 'react';
import { Box, Typography, Tooltip, IconButton, Divider } from '@mui/material';
import { Add as AddIcon, Upload as UploadIcon, Download as DownloadIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import SettingsMenu from '../components/SettingsMenu';
import { useAuth } from '../contexts/AuthContext';
import { useBoards } from '../contexts/BoardContext';
import boardService from '../services/boardService';
import { generateRandomGradientColors } from '../services/colorService';

import BoardList from '../components/BoardList';
import CreateBoardDialog from '../components/CreateBoardDialog';
import EditBoardDialog from '../components/EditBoardDialog';
import ColorPickerDialog from '../components/ColorPickerDialog';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import ImportBoardJsonDialog from '../components/ImportBoardJsonDialog';

function DashboardPage() {
    const { user } = useAuth();
    const { boards, fetchBoards } = useBoards();
    const navigate = useNavigate();
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openColorPickerDialog, setOpenColorPickerDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openImportDialog, setOpenImportDialog] = useState(false);
    const [editingBoard, setEditingBoard] = useState(null);
    const [deletingBoardId, setDeletingBoardId] = useState(null);
    const [copiedGradient, setCopiedGradient] = useState(null);

    const handleCreateBoard = async (name, description, columns, collection) => {
        try {
            const newGradientColors = generateRandomGradientColors();
            await boardService.createBoard(
                user.id,
                name,
                {
                    columns,
                    gradientColors: newGradientColors,
                    description: description,
                    columnOrder: Object.keys(columns),
                },
                collection
            );
            fetchBoards();
        } catch (error) {
            console.error('Error creating board:', error);
        }
    };

    const handleEditBoard = (board) => {
        setEditingBoard(board);
        setOpenEditDialog(true);
    };

    const handleSaveBoard = async (id, name, description, collection) => {
        try {
            const boardToUpdate = boards.find((board) => board.id === id);
            if (boardToUpdate) {
                const updatedData = { ...boardToUpdate.data, description: description };
                await boardService.updateBoard(id, name, updatedData, collection);
                fetchBoards();
            }
        } catch (error) {
            console.error('Error saving edited board:', error);
        }
    };

    const handleDeleteBoard = (id) => {
        setDeletingBoardId(id);
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await boardService.deleteBoard(deletingBoardId);
            fetchBoards();
        } catch (error) {
            console.error('Error deleting board:', error);
        } finally {
            setOpenDeleteDialog(false);
            setDeletingBoardId(null);
        }
    };

    const handleCopyGradient = (board) => {
        setCopiedGradient(board.data.gradientColors);
    };

    const handlePasteGradient = async (board) => {
        if (copiedGradient) {
            try {
                const updatedData = { ...board.data, gradientColors: copiedGradient };
                await boardService.updateBoard(board.id, board.name, updatedData);
                fetchBoards();
            } catch (error) {
                console.error('Error pasting gradient:', error);
            }
        }
    };

    const handleChangeGradient = async (board) => {
        try {
            const newGradientColors = generateRandomGradientColors();
            const updatedData = { ...board.data, gradientColors: newGradientColors };
            await boardService.updateBoard(board.id, board.name, updatedData);
            fetchBoards();
        } catch (error) {
            console.error('Error changing gradient:', error);
        }
    };

    const handleLongPressChangeGradient = (board) => {
        setEditingBoard(board);
        setOpenColorPickerDialog(true);
    };

    const handleSaveGradient = async (id, gradient) => {
        try {
            const boardToUpdate = boards.find((board) => board.id === id);
            const updatedData = { ...boardToUpdate.data, gradientColors: gradient };
            await boardService.updateBoard(id, boardToUpdate.name, updatedData);
            fetchBoards();
        } catch (error) {
            console.error('Error saving gradient:', error);
        }
    };

    const handleImport = async (boardData) => {
        try {
            await boardService.importBoardJson(boardData, user.id);
            fetchBoards();
        } catch (error) {
            console.error('Error importing board:', error);
        }
    };

    const handleNavigateToBoard = (boardId) => {
        navigate(`/board/${boardId}`);
    };

    const handleExportAllBoards = async () => {
        try {
            await boardService.exportAllBoardsMarkdownAsZip(user.id);
        } catch (error) {
            console.error('Error exporting all boards:', error);
            // Optionally, show a user-friendly error message
        }
    };

    const importMenuItems = [
        { text: 'Import from JSON', icon: <UploadIcon />, onClick: () => setOpenImportDialog(true) },
        { text: 'Export all boards as Markdown ZIP', icon: <DownloadIcon />, onClick: handleExportAllBoards },
    ];

    const groupedBoards = useMemo(() => {
        const groups = { Default: [] }; // Use 'Default' as a key for boards without a collection

        boards.forEach((board) => {
            const collectionName = board.collection || 'Default';
            if (!groups[collectionName]) {
                groups[collectionName] = [];
            }
            groups[collectionName].push(board);
        });

        // Sort collection names alphabetically, with 'Default' always first
        const sortedCollectionNames = Object.keys(groups).sort((a, b) => {
            if (a === 'Default') return -1;
            if (b === 'Default') return 1;
            return a.localeCompare(b);
        });

        const sortedGroups = {};
        sortedCollectionNames.forEach((name) => {
            sortedGroups[name] = groups[name];
        });

        return sortedGroups;
    }, [boards]);

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" gutterBottom>
                    Your Kanban Boards
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Add a board">
                        <IconButton
                            aria-label="create new board"
                            onClick={() => setOpenCreateDialog(true)}
                            color="inherit"
                        >
                            <AddIcon />
                        </IconButton>
                    </Tooltip>
                    <SettingsMenu menuItems={importMenuItems} />
                </Box>
            </Box>

            {Object.entries(groupedBoards).map(([collectionName, boardsInCollection]) => (
                <Box key={collectionName} sx={{ mb: 4 }}>
                    <Typography variant="h5" gutterBottom sx={{ mt: 2, mb: 1 }}>
                        {collectionName === 'Default' ? 'Boards' : collectionName}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <BoardList
                        boards={boardsInCollection}
                        onEdit={handleEditBoard}
                        onDelete={handleDeleteBoard}
                        onCopyGradient={handleCopyGradient}
                        onPasteGradient={handlePasteGradient}
                        onChangeGradient={handleChangeGradient}
                        onLongPressChangeGradient={handleLongPressChangeGradient}
                        copiedGradient={copiedGradient}
                        onNavigateToBoard={handleNavigateToBoard}
                    />
                </Box>
            ))}

            <CreateBoardDialog
                open={openCreateDialog}
                onClose={() => setOpenCreateDialog(false)}
                onCreateBoard={handleCreateBoard}
            />

            {editingBoard && (
                <EditBoardDialog
                    open={openEditDialog}
                    onClose={() => setOpenEditDialog(false)}
                    board={editingBoard}
                    onSave={handleSaveBoard}
                />
            )}

            {editingBoard && (
                <ColorPickerDialog
                    open={openColorPickerDialog}
                    onClose={() => setOpenColorPickerDialog(false)}
                    board={editingBoard}
                    onSave={handleSaveGradient}
                />
            )}

            <DeleteConfirmationDialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                onConfirm={handleConfirmDelete}
            />

            <ImportBoardJsonDialog
                open={openImportDialog}
                onClose={() => setOpenImportDialog(false)}
                onImport={handleImport}
            />
        </Box>
    );
}

export default DashboardPage;
