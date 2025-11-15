import React, { useState, useRef } from 'react';
import {
    Paper,
    Typography,
    Box,
    Button,
    TextField,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Slider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DragHandleIcon from '@mui/icons-material/DragHandle'; // Import a drag handle icon
import PaletteIcon from '@mui/icons-material/Palette'; // Import PaletteIcon
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import ArchiveIcon from '@mui/icons-material/Archive'; // Import ArchiveIcon
import DeleteConfirmationDialog from './DeleteConfirmationDialog'; // Import DeleteConfirmationDialog
import Task from './Task';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core'; // Import useDroppable
import { useTheme } from '@mui/material/styles'; // Import useTheme

// Helper function to convert RGB to Hex
const rgbToHex = (r, g, b) => `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;

// Helper function to format RGB string
const formatRgbString = (r, g, b) => `${r}, ${g}, ${b}`;

function Column({
    column,
    boardId,
    getParentDisplayId,
    onAddTask,
    onDeleteTask,
    onDeleteColumn,
    onUpdateColumn,
    tasksMap,
    isFirst,
    onArchiveColumn,
    onArchiveTask,
}) {
    const theme = useTheme();
    const [newTaskContent, setNewTaskContent] = useState('');
    const [isMinimized, setIsMinimized] = useState(column.minimized || false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState(column.title);

    const {
        attributes,
        listeners,
        setNodeRef: setSortableNodeRef,
        transform,
        transition,
    } = useSortable({ id: column.id });
    const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({ id: column.id });

    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const [openArchiveConfirm, setOpenArchiveConfirm] = useState(false); // New state for archive confirmation

    const handleDeleteColumnClick = () => {
        setOpenDeleteConfirm(true);
    };

    const handleConfirmDeleteColumn = () => {
        onDeleteColumn(column.id);
        setOpenDeleteConfirm(false);
    };

    const handleCancelDeleteColumn = () => {
        setOpenDeleteConfirm(false);
    };

    const handleArchiveColumnClick = () => {
        setOpenArchiveConfirm(true);
    };

    const handleConfirmArchiveColumn = () => {
        onArchiveColumn(column.id);
        setOpenArchiveConfirm(false);
    };

    const handleCancelArchiveColumn = () => {
        setOpenArchiveConfirm(false);
    };

    const handleToggleMinimize = () => {
        const newMinimizedState = !isMinimized;
        setIsMinimized(newMinimizedState);
        onUpdateColumn(column.id, { minimized: newMinimizedState });
    };

    const handleTitleChange = (e) => {
        setEditedTitle(e.target.value);
    };

    const handleTitleBlur = () => {
        if (editedTitle.trim() !== '' && editedTitle !== column.title) {
            onUpdateColumn(column.id, { title: editedTitle });
        } else {
            setEditedTitle(column.title); // Revert if empty or unchanged
        }
        setIsEditingTitle(false);
    };

    const handleTitleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent new line in TextField
            handleTitleBlur();
        }
    };

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        minWidth: '320px',
        maxWidth: '340px',
        // Use theme colors for background
        backgroundColor: isOver ? theme.palette.action.hover : theme.palette.background.paper,
        borderRadius: '8px',
        padding: '16px',
        margin: '0 8px',
        marginLeft: isFirst ? 0 : '8px', // Conditionally set marginLeft
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 1px 0 rgba(9, 30, 66, 0.25)',
        // Always have a subtle border, highlight with primary color when isOver
        border: isOver ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
    };

    const [colorPickerOpen, setColorPickerOpen] = useState(false);
    const [baseColor, setBaseColor] = useState({ r: 255, g: 255, b: 255 });
    const longPressTimer = useRef(null);

    const handleLongPressStart = () => {
        longPressTimer.current = setTimeout(() => {
            // Initialize baseColor from existing column highlightColor
            const hex = column.highlightColor;
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            setBaseColor({ r, g, b });
            setColorPickerOpen(true);
        }, 500); // 500ms for long press
    };

    const handleLongPressEnd = () => {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
    };

    const handleColorChange = (e) => {
        const { name, value } = e.target;
        setBaseColor((prev) => ({ ...prev, [name]: Number(value) }));
    };

    const handleSaveBaseColor = () => {
        const hexColor = `#${baseColor.r.toString(16).padStart(2, '0')}${baseColor.g.toString(16).padStart(2, '0')}${baseColor.b.toString(16).padStart(2, '0')}`;
        onUpdateColumn(column.id, { highlightColor: hexColor });
        setColorPickerOpen(false);
    };

    const handleCloseColorPicker = () => {
        setColorPickerOpen(false);
    };

    const handleAddTask = () => {
        if (newTaskContent.trim() !== '') {
            onAddTask(column.id, newTaskContent);
            setNewTaskContent('');
        }
    };

    return (
        <Paper
            ref={(node) => {
                setSortableNodeRef(node);
                setDroppableNodeRef(node);
            }}
            style={style}
            {...attributes}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                {isEditingTitle ? (
                    <TextField
                        value={editedTitle}
                        onChange={handleTitleChange}
                        onBlur={handleTitleBlur}
                        onKeyPress={handleTitleKeyPress}
                        autoFocus
                        variant="standard"
                        size="small"
                        sx={{ flexGrow: 1, '& .MuiInputBase-input': { padding: '4px 0' } }}
                    />
                ) : (
                    <Typography
                        variant="h6"
                        sx={{ fontWeight: 'bold', cursor: 'pointer', flexGrow: 1 }}
                        onClick={() => setIsEditingTitle(true)}
                    >
                        {column.title}
                    </Typography>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton size="small" onClick={handleToggleMinimize}>
                        {isMinimized ? <UnfoldMoreIcon /> : <UnfoldLessIcon />}
                    </IconButton>
                    <IconButton size="small" {...listeners}>
                        <DragHandleIcon />
                    </IconButton>{' '}
                    {/* Drag handle */}
                    <IconButton
                        size="small"
                        onMouseDown={handleLongPressStart}
                        onMouseUp={handleLongPressEnd}
                        onMouseLeave={handleLongPressEnd}
                        onClick={() => {
                            if (!longPressTimer.current) {
                                // Short press behavior: open color picker
                                const hex = column.highlightColor;
                                const r = parseInt(hex.slice(1, 3), 16);
                                const g = parseInt(hex.slice(3, 5), 16);
                                const b = parseInt(hex.slice(5, 7), 16);
                                setBaseColor({ r, g, b });
                                setColorPickerOpen(true);
                            }
                            clearTimeout(longPressTimer.current); // Clear any pending long press timer
                            longPressTimer.current = null;
                        }}
                    >
                        <PaletteIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={handleArchiveColumnClick} disabled={column.tasks.length === 0}>
                        <ArchiveIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={handleDeleteColumnClick}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>
            {isMinimized ? (
                <Box
                    sx={{
                        flexGrow: 1,
                        minHeight: '50px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Typography variant="subtitle1" color="text.secondary">
                        {column.tasks.length} tasks
                    </Typography>
                </Box>
            ) : (
                <SortableContext
                    items={column.tasks ? column.tasks.map((task) => task.id) : []}
                    strategy={verticalListSortingStrategy}
                >
                    <Box
                        sx={{
                            flexGrow: 1,
                            minHeight: '50px',
                            maxHeight: 'calc(100vh - 300px)',
                            overflowY: 'auto',
                            '&::-webkit-scrollbar': {
                                display: 'none',
                            },
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                        }}
                    >
                        {' '}
                        {/* Added maxHeight and overflowY */}
                        {(column.tasks || []).map((task) => (
                            <Task
                                key={task.id}
                                task={task}
                                boardId={boardId}
                                getParentDisplayId={getParentDisplayId}
                                onDelete={onDeleteTask}
                                onArchiveTask={onArchiveTask}
                                highlightColor={column.highlightColor}
                                tasksMap={tasksMap}
                            />
                        ))}
                    </Box>
                </SortableContext>
            )}
            <Box sx={{ mt: 2 }}>
                <TextField
                    fullWidth
                    placeholder="Add a task"
                    value={newTaskContent}
                    onChange={(e) => setNewTaskContent(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleAddTask();
                        }
                    }}
                />
                <Button fullWidth variant="contained" startIcon={<AddIcon />} onClick={handleAddTask} sx={{ mt: 1 }}>
                    Add Task
                </Button>
            </Box>

            <Dialog open={colorPickerOpen} onClose={handleCloseColorPicker}>
                <DialogTitle>Select Column Color</DialogTitle>
                <DialogContent>
                    <Box sx={{ width: '100%', mb: 3 }}>
                        <Typography gutterBottom>Red</Typography>
                        <Slider
                            name="r"
                            value={baseColor.r}
                            onChange={handleColorChange}
                            min={0}
                            max={255}
                            valueLabelDisplay="auto"
                        />
                        <Typography gutterBottom>Green</Typography>
                        <Slider
                            name="g"
                            value={baseColor.g}
                            onChange={handleColorChange}
                            min={0}
                            max={255}
                            valueLabelDisplay="auto"
                        />
                        <Typography gutterBottom>Blue</Typography>
                        <Slider
                            name="b"
                            value={baseColor.b}
                            onChange={handleColorChange}
                            min={0}
                            max={255}
                            valueLabelDisplay="auto"
                        />
                    </Box>
                    <Box
                        sx={{
                            width: '100%',
                            height: '50px',
                            borderRadius: '4px',
                            background: `rgb(${baseColor.r}, ${baseColor.g}, ${baseColor.b})`,
                            border: '1px solid #ccc',
                        }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Typography variant="body2">
                            {formatRgbString(baseColor.r, baseColor.g, baseColor.b)}
                        </Typography>
                        <Typography variant="body2">{rgbToHex(baseColor.r, baseColor.g, baseColor.b)}</Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseColorPicker}>Cancel</Button>
                    <Button onClick={handleSaveBaseColor}>Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openDeleteConfirm} onClose={handleCancelDeleteColumn}>
                <DialogTitle>Confirm Column Deletion</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this column? All tasks within it will also be deleted. This
                        action is not reversible.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDeleteColumn}>Cancel</Button>
                    <Button onClick={handleConfirmDeleteColumn} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <DeleteConfirmationDialog
                open={openArchiveConfirm}
                onClose={handleCancelArchiveColumn}
                onConfirm={handleConfirmArchiveColumn}
                title="Confirm Column Archival"
                message="Are you sure you want to archive all tasks in this column? The column will remain, but its tasks will be moved to the archive. This action is not reversible."
                confirmButtonText="Confirm Archival"
            />
        </Paper>
    );
}

export default Column;
