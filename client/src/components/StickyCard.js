import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Card, CardContent, Tooltip, Menu, MenuItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import { marked } from 'marked';

function StickyCard({ 
    sticky, 
    onEdit, 
    onDelete, 
    dragHandleProps, 
    viewMode = 'list',
    useKababMenu = true
}) {
    const [copied, setCopied] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const htmlContent = marked.parse(sticky.content || '');

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleDelete = () => {
        onDelete(sticky.id);
        handleMenuClose();
    };

    const handleEdit = () => {
        onEdit(sticky);
        handleMenuClose();
    };

    const handleCopy = async () => {
        const details = `${sticky.title}\n\n${sticky.content}`;
        try {
            await navigator.clipboard.writeText(details);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            handleMenuClose();
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const isList = viewMode === 'list';

    return (
        <Card sx={{
            width: '100%', 
            mb: 1, 
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            borderRadius: '8px',
            '&:hover .action-buttons': {
                visibility: 'visible',
                opacity: 1,
            }
        }}>
            <CardContent sx={{
                flexGrow: 1, 
                p: '12px 16px !important',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 2
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <StickyNote2Icon sx={{ color: '#fdfd96' }} />
                </Box>
                
                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {sticky.title}
                    </Typography>
                    <Box 
                        className="markdown-content"
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                        sx={{
                            fontSize: '0.875rem',
                            color: 'text.secondary',
                            '& p': { m: 0 },
                            '& ul, & ol': { m: '4px 0', pl: '20px' },
                            maxHeight: isList ? '3em' : 'none',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: isList ? 2 : 'none',
                            WebkitBoxOrient: 'vertical',
                        }}
                    />
                </Box>

                <Box className="action-buttons" sx={{ 
                    display: 'flex', 
                    flexDirection: 'row',
                    visibility: 'hidden',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    gap: 0.5,
                }}>
                    {useKababMenu ? (
                        <>
                            <IconButton size="small" onClick={handleMenuOpen}>
                                <MoreVertIcon fontSize="small" />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                            >
                                <MenuItem onClick={handleCopy}>
                                    <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} />
                                    Copy Content
                                </MenuItem>
                                <MenuItem onClick={handleEdit}>
                                    <EditIcon fontSize="small" sx={{ mr: 1 }} />
                                    Edit
                                </MenuItem>
                                <MenuItem onClick={handleDelete}>
                                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                                    Delete
                                </MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <>
                            {dragHandleProps && (
                                <IconButton size="small" {...dragHandleProps} sx={{ cursor: 'grab' }}>
                                    <DragHandleIcon fontSize="small" />
                                </IconButton>
                            )}
                            <Tooltip title={copied ? "Copied!" : "Copy content"}>
                                <IconButton size="small" onClick={handleCopy}>
                                    {copied ? <CheckIcon fontSize="small" color="success" /> : <ContentCopyIcon fontSize="small" />}
                                </IconButton>
                            </Tooltip>
                            <IconButton size="small" onClick={() => onEdit(sticky)}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={handleDelete}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}

export default StickyCard;
