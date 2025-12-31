import React, { useState } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Card,
    CardContent,
    Tooltip,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import StickyNote2Icon from '@mui/icons-material/EditNote';
import CloseIcon from '@mui/icons-material/Close';
import { marked } from 'marked';

function StickyCard({ sticky, onEdit, onDelete, dragHandleProps, viewMode = 'card', useKababMenu = true }) {
    const [copied, setCopied] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
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

    const handleOpenView = () => {
        setIsViewOpen(true);
    };

    const handleCloseView = () => {
        setIsViewOpen(false);
    };

    const isList = viewMode === 'list';

    return (
        <>
            <Card
                sx={{
                    width: isList ? '100%' : '24rem',
                    mb: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    borderRadius: '8px',
                    height: '92px', // Uniform height
                    '&:hover .action-buttons': {
                        visibility: 'visible',
                        opacity: 1,
                    },
                }}
            >
                <CardContent
                    sx={{
                        flexGrow: 1,
                        p: '12px 16px !important',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        gap: 2,
                        height: '100%',
                        boxSizing: 'border-box',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Tooltip title="View full content">
                            <IconButton size="small" onClick={handleOpenView} sx={{ p: 0 }}>
                                <StickyNote2Icon sx={{ color: '#fdfd96', fontSize: 32 }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <Box sx={{ flexGrow: 1, overflow: 'hidden', height: '100%' }}>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 'bold',
                                mb: 0.75,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                lineHeight: 1.2,
                            }}
                            onClick={handleOpenView}
                        >
                            {sticky.title}
                        </Typography>
                        <Box
                            className="markdown-content"
                            dangerouslySetInnerHTML={{ __html: htmlContent }}
                            sx={{
                                fontSize: '0.875rem',
                                color: 'text.secondary',
                                '& p': { m: 0 },
                                '& ul, & ol': { m: 0, pl: '20px' },
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2, // Always clamp to 2 lines for uniform height
                                WebkitBoxOrient: 'vertical',
                                cursor: 'pointer',
                                lineHeight: 1.4,
                            }}
                            onClick={handleOpenView}
                        />
                    </Box>
                    <Box
                        className="action-buttons"
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            visibility: 'hidden',
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            gap: 0.5,
                        }}
                    >
                        {useKababMenu ? (
                            <>
                                <IconButton size="small" onClick={handleMenuOpen}>
                                    <MoreVertIcon fontSize="small" />
                                </IconButton>
                                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
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
                                <Tooltip title={copied ? 'Copied!' : 'Copy content'}>
                                    <IconButton size="small" onClick={handleCopy}>
                                        {copied ? (
                                            <CheckIcon fontSize="small" color="success" />
                                        ) : (
                                            <ContentCopyIcon fontSize="small" />
                                        )}
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

            <Dialog
                open={isViewOpen}
                onClose={handleCloseView}
                fullWidth
                maxWidth="md"
                aria-labelledby="sticky-view-title"
            >
                <DialogTitle
                    id="sticky-view-title"
                    sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                    <Typography variant="h6" component="div">
                        {sticky.title}
                    </Typography>
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseView}
                        sx={{
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Box
                        className="markdown-content-full"
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                        sx={{
                            '& p': { mb: 2 },
                            '& ul, & ol': { mb: 2, pl: 3 },
                            '& h1, & h2, & h3, & h4, & h5, & h6': { mb: 2 },
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleEdit} startIcon={<EditIcon />}>
                        Edit
                    </Button>
                    <Button onClick={handleCloseView} variant="contained">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default StickyCard;
