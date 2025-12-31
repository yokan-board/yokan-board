import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

function DragOverlayTask({ task, tasksMap }) {
    const theme = useTheme();

    const style = {
        marginBottom: '8px',
        padding: '12px',
        borderRadius: '4px',
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[3], // Use a theme shadow for better visibility
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'grabbing', // Indicate it's being dragged
        opacity: 0.8, // Make it slightly transparent
        minHeight: '80px',
    };

    return (
        <Paper style={style}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {task.content}
            </Typography>

            {/* Metadata mockup for overlay */}
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                {task.dueDate && (
                    <Typography variant="caption" color="text.secondary">
                        Due: {task.dueDate.split('T')[0]}
                    </Typography>
                )}
                {task.comments && task.comments.length > 0 && (
                    <Typography variant="caption" color="text.secondary">
                        {task.comments.length} {task.comments.length === 1 ? 'comment' : 'comments'}
                    </Typography>
                )}
            </Box>

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
        </Paper>
    );
}

export default DragOverlayTask;
