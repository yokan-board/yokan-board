import React, { useState } from 'react'; // Import useState
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import { marked } from 'marked'; // Import marked

function ArchiveHistoryDisplay({ archiveHistory, tasksMap }) { // Add tasksMap prop
    const theme = useTheme();
    const [expandedTaskId, setExpandedTaskId] = useState(null);

    const handleTaskClick = (taskId) => {
        setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
    };

    if (!archiveHistory || archiveHistory.length === 0) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h6" color="text.secondary">
                    No archived tasks yet.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {archiveHistory.map((entry) => (
                <Box key={entry.date} sx={{ mb: 4 }}>
                    <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                        {dayjs(entry.date).format('MMMM D, YYYY')}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                        {' '}
                        {/* Changed gap to 0 */}
                        {entry.tasks.map((task, index) => (
                            <Box
                                key={task.id}
                                sx={{
                                    p: 1.5,
                                    borderBottom: index < entry.tasks.length - 1 ? '1px solid' : 'none', // Add separator
                                    borderColor: 'divider',
                                    backgroundColor: theme.palette.background.paper,
                                    display: 'flex',
                                    flexDirection: 'column', // Changed to column to stack details
                                    alignItems: 'flex-start',
                                    cursor: 'pointer', // Indicate clickable
                                    '&:hover': {
                                        // Add hover effect
                                        backgroundColor: 'action.hover',
                                    },
                                }}
                                onClick={() => handleTaskClick(task.id)} // Add onClick handler
                            >
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                                    <Box
                                        sx={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: '50%',
                                            backgroundColor: task.highlightColor || 'grey.400',
                                            mr: 1.5,
                                            mt: 0.5,
                                            flexShrink: 0,
                                        }}
                                    />
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'text.secondary',
                                            width: '50px',
                                            flexShrink: 0,
                                            mr: 1,
                                            mt: '1px',
                                        }}
                                    >
                                        #{task.displayId}
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                                {task.content}
                                            </Typography>
                                            {task.dueDate && (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ flexShrink: 0, ml: 1 }}
                                                >
                                                    Due: {dayjs(task.dueDate).format('MMMM D, YYYY')}
                                                </Typography>
                                            )}
                                        </Box>
                                        {task.description && (
                                            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                                                {task.description.split('\n')[0]}
                                            </Typography>
                                        )}
                                        {task.createdAt && (
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                                Created: {dayjs(task.createdAt).format('MMMM D, YYYY')}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>

                                {expandedTaskId === task.id && (
                                    <Box sx={{ mt: 2, width: '100%' }}>
                                        {' '}
                                        {/* Added width: '100%' */}
                                        {task.columnTitle && (
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ mb: 1, ml: '82px' }}
                                            >
                                                {' '}
                                                {/* Added ml */}
                                                Original Column: {task.columnTitle}
                                            </Typography>
                                        )}
                                        {task.description && (
                                            <Box sx={{ mt: 1, ml: '82px' }}>
                                                {' '}
                                                {/* Removed width */}
                                                <Typography variant="subtitle2" gutterBottom>
                                                    Description:
                                                </Typography>
                                                <Box
                                                    dangerouslySetInnerHTML={{ __html: marked.parse(task.description) }}
                                                    sx={{
                                                        py: 1,
                                                        px: 2, // Increased horizontal padding
                                                        border: `1px solid ${theme.palette.divider}`,
                                                        borderRadius: 1,
                                                        backgroundColor: theme.palette.common.white, // Set background to white
                                                        color: '#222', // Set text color
                                                        maxHeight: '200px',
                                                        overflowY: 'auto',
                                                    }}
                                                />
                                            </Box>
                                        )}
                                    </Box>
                                )}
                            </Box>
                        ))}
                    </Box>
                </Box>
            ))}
        </Box>
    );
}

export default ArchiveHistoryDisplay;
