import React, { useState, useMemo, useEffect } from 'react';
import { Box, Typography, Tooltip, IconButton, Divider } from '@mui/material';
import { Add as AddIcon, Upload as UploadIcon, Download as DownloadIcon } from '@mui/icons-material';
import {
    DndContext,
    closestCorners,
    useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor,
    DragOverlay,
    useDroppable,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';

import SettingsMenu from '../components/SettingsMenu';
import { useAuth } from '../contexts/AuthContext';
import { useBoards } from '../contexts/BoardContext';
import boardService from '../services/boardService';
import userService from '../services/userService';
import { generateRandomGradientColors } from '../services/colorService';

import BoardList from '../components/BoardList';
import BoardCard from '../components/BoardCard';
import CreateBoardDialog from '../components/CreateBoardDialog';
import EditBoardDialog from '../components/EditBoardDialog';
import ColorPickerDialog from '../components/ColorPickerDialog';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import ImportBoardJsonDialog from '../components/ImportBoardJsonDialog';

function DashboardPage() {
    const { user } = useAuth();
    const { boards, fetchBoards, setBoards } = useBoards();
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openColorPickerDialog, setOpenColorPickerDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openImportDialog, setOpenImportDialog] = useState(false);
    const [editingBoard, setEditingBoard] = useState(null);
    const [deletingBoardId, setDeletingBoardId] = useState(null);
    const [copiedGradient, setCopiedGradient] = useState(null);
    const [hideUnnamedCollectionHeading, setHideUnnamedCollectionHeading] = useState(false);
    const [activeId, setActiveId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const prefs = await userService.getPreferences();
                if (prefs && typeof prefs.hideUnnamedCollectionHeading !== 'undefined') {
                    setHideUnnamedCollectionHeading(prefs.hideUnnamedCollectionHeading);
                }
            } catch (error) {
                console.error('Error fetching user preferences:', error);
            }
        };
        fetchPreferences();
    }, []);

    const handleCreateBoard = async (name, data, collection) => {
        try {
            const newGradientColors = generateRandomGradientColors();
            const finalData = {
                ...data,
                gradientColors: newGradientColors,
            };
            await boardService.createBoard(user.id, name, finalData, collection);
            fetchBoards();
        } catch (error) {
            console.error('Error creating board:', error);
        }
    };

    const handleEditBoard = (board) => {
        setEditingBoard(board);
        setOpenEditDialog(true);
    };

    const handleSaveBoard = async (id, name, data, collection) => {
        try {
            await boardService.updateBoard(id, name, data, collection);
            fetchBoards();
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

    const handleImport = async (boardData, collection) => {
        try {
            await boardService.importBoardJson(boardData, user.id, collection);
            fetchBoards();
        } catch (error) {
            console.error('Error importing board:', error);
        }
    };

    const handleExportAllBoards = async () => {
        try {
            await boardService.exportAllBoardsMarkdownAsZip(user.id);
        } catch (error) {
            console.error('Error exporting all boards:', error);
        }
    };

    const importMenuItems = [
        { text: 'Import from JSON', icon: <UploadIcon />, onClick: () => setOpenImportDialog(true) },
        { text: 'Export all boards as Markdown ZIP', icon: <DownloadIcon />, onClick: handleExportAllBoards },
    ];

    const groupedBoards = useMemo(() => {
        const groups = { Default: [] };

        boards.forEach((board) => {
            const collectionName = board.collection || 'Default';
            if (!groups[collectionName]) {
                groups[collectionName] = [];
            }
            groups[collectionName].push(board);
        });

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

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragOver = (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const activeData = active.data.current;
        const overData = over.data.current;

        if (activeData?.type !== 'Board') return;

        const activeBoard = boards.find(b => b.id === activeId);
        const activeContainer = activeBoard?.collection || 'Default';

        let overContainer = null;
        if (overData?.type === 'Collection') {
            overContainer = overData.collectionName;
        } else if (overData?.type === 'Board') {
            overContainer = overData.board.collection || 'Default';
        }

        if (!overContainer || activeContainer === overContainer) return;

        setBoards((prev) => {
            const activeIndex = prev.findIndex((b) => b.id === activeId);
            const overIndex = prev.findIndex((b) => b.id === overId);

            let newIndex;
            if (overData?.type === 'Board') {
                newIndex = overIndex;
            } else {
                const collectionBoards = prev.filter(b => (b.collection || 'Default') === overContainer);
                if (collectionBoards.length > 0) {
                    const lastBoard = collectionBoards[collectionBoards.length - 1];
                    newIndex = prev.findIndex(b => b.id === lastBoard.id) + 1;
                } else {
                    const collectionNames = Object.keys(groupedBoards);
                    const overCollIndex = collectionNames.indexOf(overContainer);
                    
                    if (overCollIndex <= 0) { 
                        newIndex = 0;
                    } else {
                        const prevCollName = collectionNames[overCollIndex - 1];
                        const prevCollBoards = prev.filter(b => (b.collection || 'Default') === prevCollName);
                        if (prevCollBoards.length > 0) {
                            const lastOfPrev = prevCollBoards[prevCollBoards.length - 1];
                            newIndex = prev.findIndex(b => b.id === lastOfPrev.id) + 1;
                        } else {
                            newIndex = 0;
                        }
                    }
                }
            }

            const updatedBoard = {
                ...prev[activeIndex],
                collection: overContainer === 'Default' ? null : overContainer
            };

            const result = [...prev];
            result.splice(activeIndex, 1);
            const finalIndex = (overIndex >= 0 && newIndex > activeIndex) ? newIndex - 1 : newIndex;
            result.splice(finalIndex, 0, updatedBoard);
            return result;
        });
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const activeIndex = boards.findIndex((b) => b.id === activeId);
        const overIndex = boards.findIndex((b) => b.id === overId);

        let finalBoards = [...boards];

        if (activeIndex !== overIndex) {
            finalBoards = arrayMove(boards, activeIndex, overIndex);
            setBoards(finalBoards);
        }

        const movedBoard = finalBoards[overIndex];
        if (!movedBoard) return;

        try {
            await boardService.updateBoard(movedBoard.id, movedBoard.name, movedBoard.data, movedBoard.collection);
            
            const positions = finalBoards.map((board, index) => ({
                id: board.id,
                position: index + 1,
            }));
            await boardService.reorderBoards(positions);
            fetchBoards();
        } catch (error) {
            console.error('Error persisting reorder:', error);
            fetchBoards();
        }
    };

    const handleDragCancel = () => {
        setActiveId(null);
        fetchBoards();
    };

    const activeBoard = activeId ? boards.find((b) => b.id === activeId) : null;

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
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

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                {Object.entries(groupedBoards).map(([collectionName, boardsInCollection]) => (
                    <CollectionSection
                        key={collectionName}
                        collectionName={collectionName}
                        boards={boardsInCollection}
                        hideUnnamedCollectionHeading={hideUnnamedCollectionHeading}
                        onEdit={handleEditBoard}
                        onDelete={handleDeleteBoard}
                        onCopyGradient={handleCopyGradient}
                        onPasteGradient={handlePasteGradient}
                        onChangeGradient={handleChangeGradient}
                        onLongPressChangeGradient={handleLongPressChangeGradient}
                        copiedGradient={copiedGradient}
                    />
                ))}
                <DragOverlay>
                    {activeBoard ? (
                        <BoardCard
                            board={activeBoard}
                            isOverlay
                            copiedGradient={copiedGradient}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>

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

const CollectionSection = ({
    collectionName,
    boards,
    hideUnnamedCollectionHeading,
    onEdit,
    onDelete,
    onCopyGradient,
    onPasteGradient,
    onChangeGradient,
    onLongPressChangeGradient,
    copiedGradient,
}) => {
    const { setNodeRef, isOver } = useDroppable({
        id: `collection-${collectionName}`,
        data: {
            type: 'Collection',
            collectionName,
        },
    });

    return (
        <Box 
            ref={setNodeRef}
            sx={{ 
                mb: 4,
                p: 3,
                borderRadius: 2,
                backgroundColor: isOver ? 'action.hover' : 'transparent',
                transition: 'background-color 0.2s',
                minHeight: '200px',
                border: '2px solid transparent',
                ...(isOver && {
                    border: '2px dashed',
                    borderColor: 'primary.main',
                })
            }}
        >
            {!(collectionName === 'Default' && hideUnnamedCollectionHeading) && (
                <>
                    <Typography variant="h5" gutterBottom sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>
                        {collectionName === 'Default' ? 'Boards' : collectionName}
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                </>
            )}
            <BoardList
                boards={boards}
                onEdit={onEdit}
                onDelete={onDelete}
                onCopyGradient={onCopyGradient}
                onPasteGradient={onPasteGradient}
                onChangeGradient={onChangeGradient}
                onLongPressChangeGradient={onLongPressChangeGradient}
                copiedGradient={copiedGradient}
            />
        </Box>
    );
};

export default DashboardPage;