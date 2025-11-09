import React from 'react';
import { Typography, Box, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { marked } from 'marked';

function MarkdownPreview({ markdown }) {
    const html = marked.parse(markdown || '');
    return <Box dangerouslySetInnerHTML={{ __html: html }} sx={{ p: 1, maxWidth: 300 }} />;
}

function ParentTaskDisplay({ parentTaskObject, boardId }) {
    const navigate = useNavigate();
    const theme = useTheme();

    const handleClick = () => {
        if (parentTaskObject) {
            navigate(`/task/edit/${boardId}/${parentTaskObject.id}`);
        }
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
                Parent Task
            </Typography>
            <Box
                onClick={handleClick}
                sx={{
                    cursor: parentTaskObject ? 'pointer' : 'default',
                    p: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    '&:hover': {
                        backgroundColor: parentTaskObject ? 'action.hover' : 'inherit',
                    },
                    minHeight: '56px',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: !parentTaskObject ? 'rgba(0, 0, 0, 0.06)' : 'transparent',
                }}
            >
                {parentTaskObject ? (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                        <Box
                            sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: parentTaskObject.highlightColor || 'grey.400',
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
                            #{parentTaskObject.displayId}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                {parentTaskObject.content}
                            </Typography>
                            {parentTaskObject.description && (
                                <Tooltip
                                    title={<MarkdownPreview markdown={parentTaskObject.description} />}
                                    placement="bottom-start"
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'text.secondary',
                                            mt: 0.5,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}
                                    >
                                        {parentTaskObject.description.split('\n')[0]}
                                    </Typography>
                                </Tooltip>
                            )}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, ml: 1 }}>
                            {parentTaskObject.dueDate && (
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'text.secondary',
                                        textAlign: 'right',
                                        flexShrink: 0,
                                        mt: '1px',
                                    }}
                                >
                                    {new Date(parentTaskObject.dueDate).toLocaleDateString()}
                                </Typography>
                            )}
                            {/* Placeholder to align with subtask list's delete icon */}
                            <Box sx={{ width: 24, height: 24, ml: 0.5 }} />
                        </Box>
                    </Box>
                ) : (
                    <Typography variant="body1" sx={{ color: theme.palette.text.disabled, ml: '14px' }}>
                        None
                    </Typography>
                )}
            </Box>
        </Box>
    );
}

export default ParentTaskDisplay;
