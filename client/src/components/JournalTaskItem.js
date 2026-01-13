import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import dayjs from 'dayjs';
import { marked } from 'marked';
import { useNavigate } from 'react-router-dom';

function JournalTaskItem({ task, isExpanded, onToggleExpand }) {
    const theme = useTheme();
    const navigate = useNavigate();

    const handleJumpToTask = (e) => {
        e.stopPropagation();
        navigate(`/task/edit/${task.boardId}/${task.id}`);
    };

    return (
        <Box
            sx={{
                p: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                backgroundColor: theme.palette.background.paper,
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                    backgroundColor: 'action.hover',
                },
            }}
            onClick={onToggleExpand}
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
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                {task.content}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {task.boardName} / {task.columnName}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {task.dueDate && (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ flexShrink: 0 }}
                                >
                                    Due: {dayjs(task.dueDate).format('MMM D, YYYY')}
                                </Typography>
                            )}
                            <Tooltip title="Jump to Board Task">
                                <IconButton size="small" onClick={handleJumpToTask}>
                                    <OpenInNewIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {isExpanded && task.description && (
                <Box sx={{ mt: 2, ml: '82px' }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Description
                    </Typography>
                    <Box
                        dangerouslySetInnerHTML={{ __html: marked.parse(task.description) }}
                        sx={{
                            py: 1,
                            px: 2,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 1,
                            backgroundColor: theme.palette.mode === 'light' ? '#fff' : 'background.default',
                            color: theme.palette.text.primary,
                            maxHeight: '300px',
                            overflowY: 'auto',
                            '& p': { m: 0 },
                        }}
                    />
                </Box>
            )}
        </Box>
    );
}

export default JournalTaskItem;
