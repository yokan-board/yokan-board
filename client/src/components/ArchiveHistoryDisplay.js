import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';

function ArchiveHistoryDisplay({ archiveHistory }) {
    const theme = useTheme();

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
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {entry.tasks.map((task) => (
                            <Paper
                                key={task.id}
                                sx={{
                                    p: 1.5,
                                    border: `1px solid ${theme.palette.divider}`,
                                    borderRadius: 1,
                                    backgroundColor: theme.palette.background.paper,
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                }}
                            >
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
                                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                        {task.content}
                                    </Typography>
                                    {task.description && (
                                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                                            {task.description.split('\n')[0]}
                                        </Typography>
                                    )}
                                    {task.dueDate && (
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                            Due: {dayjs(task.dueDate).format('MMMM D, YYYY')}
                                        </Typography>
                                    )}
                                    {task.archivedAt && (
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                            Archived: {dayjs(task.archivedAt).format('MMMM D, YYYY')}
                                        </Typography>
                                    )}
                                </Box>
                            </Paper>
                        ))}
                    </Box>
                </Box>
            ))}
        </Box>
    );
}

export default ArchiveHistoryDisplay;
