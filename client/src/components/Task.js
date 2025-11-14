import React from 'react';
import { Paper, Typography, IconButton, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'; // Import EditIcon
import DragHandleIcon from '@mui/icons-material/DragHandle'; // Import DragHandleIcon
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function Task({ task, boardId, getParentDisplayId, onDelete, highlightColor, tasksMap }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
    const theme = useTheme();
    const navigate = useNavigate();

    const handleNavigateToEdit = () => {
        navigate(`/task/edit/${boardId}/${task.id}`);
    };

    const parentDisplayId = task.parentId ? getParentDisplayId(task.parentId) : null;

    return (
        <Paper
            ref={setNodeRef}
            sx={{
                transform: CSS.Transform.toString(transform),
                transition,
                marginBottom: '8px',
                padding: '12px',
                borderRadius: '4px',
                border: `1px solid ${theme.palette.divider}`,
                borderLeft: `4px solid ${highlightColor}`, // Use highlightColor for the left border
                paddingLeft: '8px', // Adjust padding to account for the new border
                backgroundColor: theme.palette.background.paper, // Use theme color
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                position: 'relative',
                minHeight: '80px',
                '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                    '& [data-testid="task-icons"]': {
                        // Target the icons Box
                        opacity: 1,
                        visibility: 'visible',
                    },
                },
            }}
            {...attributes}
            onClick={handleNavigateToEdit}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="body1" sx={{ flexGrow: 1 }}>
                    {task.content}
                </Typography>
                {task.displayId && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        #{task.displayId}
                    </Typography>
                )}
            </Box>

            {/* Placeholder for new attributes */}
            {task.dueDate &&
                (() => {
                    const dateParts = task.dueDate.split('T')[0].split('-');
                    const year = parseInt(dateParts[0]);
                    const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
                    const day = parseInt(dateParts[2]);
                    const localDate = new Date(year, month, day);
                    return (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                            Due: {localDate.toLocaleDateString()}
                        </Typography>
                    );
                })()}
            {parentDisplayId && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    Parent: #{parentDisplayId}
                </Typography>
            )}
            {task.subtasks && task.subtasks.length > 0 && (
                <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {task.subtasks.map((subtaskId, index) => {
                        const subtask = tasksMap[subtaskId];
                        const bulletColor = subtask ? subtask.highlightColor : theme.palette.text.secondary;
                        return (
                            <Typography key={index} variant="caption" sx={{ color: bulletColor, fontSize: '1.2em' }}>
                                ●
                            </Typography>
                        );
                    })}
                </Box>
            )}

            <Box
                data-testid="task-icons" // Add data-testid
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    mt: 1,
                    opacity: 0, // Initially hidden
                    visibility: 'hidden', // Initially hidden
                    transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out', // Smooth transition
                }}
            >
                <IconButton size="small" {...listeners} sx={{ cursor: 'grab' }} onClick={(e) => e.stopPropagation()}>
                    <DragHandleIcon fontSize="small" />
                </IconButton>
                <IconButton
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleNavigateToEdit();
                    }}
                >
                    <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(task.id);
                    }}
                >
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </Box>
        </Paper>
    );
}

export default Task;
