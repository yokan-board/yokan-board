import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Avatar, IconButton, Menu, MenuItem, Paper } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import md5 from 'md5';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

function TaskComments({ comments, setComments, currentUser, readOnly = false, absoluteDates = false }) {
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedCommentId, setSelectedCommentId] = useState(null);

    const handleAddComment = () => {
        if (!newComment.trim()) return;

        const comment = {
            id: crypto.randomUUID(),
            userId: currentUser.id,
            username: currentUser.username || currentUser.display_name || 'User',
            userEmail: currentUser.email,
            content: newComment,
            createdAt: new Date().toISOString(),
        };

        setComments([comment, ...comments]);
        setNewComment('');
    };

    const handleMenuOpen = (event, commentId) => {
        setAnchorEl(event.currentTarget);
        setSelectedCommentId(commentId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedCommentId(null);
    };

    const handleDeleteComment = () => {
        setComments(comments.filter((c) => c.id !== selectedCommentId));
        handleMenuClose();
    };

    const handleEditStart = () => {
        const comment = comments.find((c) => c.id === selectedCommentId);
        if (comment) {
            setEditingCommentId(selectedCommentId);
            setEditContent(comment.content);
        }
        handleMenuClose();
    };

    const handleEditSave = () => {
        setComments(
            comments.map((c) =>
                c.id === editingCommentId ? { ...c, content: editContent, updatedAt: new Date().toISOString() } : c
            )
        );
        setEditingCommentId(null);
        setEditContent('');
    };

    const handleEditCancel = () => {
        setEditingCommentId(null);
        setEditContent('');
    };

    const getGravatarUrl = (email) => {
        return email
            ? `https://www.gravatar.com/avatar/${md5(email.trim().toLowerCase())}?d=identicon`
            : `https://www.gravatar.com/avatar/?d=identicon`;
    };

    return (
        <Box sx={{ mt: 0 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Comments
            </Typography>

            {/* Add Comment Section */}
            {!readOnly && (
                <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                    <Avatar
                        sx={{ ml: 0.5, mt: 0.5 }}
                        src={getGravatarUrl(currentUser?.email)}
                        alt={currentUser?.username || 'User'}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            variant="outlined"
                            sx={{ mb: 1 }}
                        />
                        <Button variant="contained" disabled={!newComment.trim()} onClick={handleAddComment}>
                            Comment
                        </Button>
                    </Box>
                </Box>
            )}

            {/* Comments List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {comments.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        No comments yet.
                    </Typography>
                )}
                {comments.map((comment) => (
                    <Paper key={comment.id} elevation={1} sx={{ p: 2, position: 'relative' }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Avatar
                                src={getGravatarUrl(comment.userEmail)}
                                alt={comment.username}
                                sx={{ width: 32, height: 32 }}
                            />
                            <Box sx={{ flexGrow: 1 }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        mb: 0.5,
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            {comment.username}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {absoluteDates
                                                ? `${dayjs(comment.createdAt).format('YYYY-MM-DD [at] hh:mm:ss A')} (${dayjs(comment.createdAt).fromNow()})`
                                                : dayjs(comment.createdAt).fromNow()}
                                            {comment.updatedAt && ' (edited)'}
                                        </Typography>
                                    </Box>
                                    {!readOnly && (currentUser?.id === comment.userId || currentUser?.isAdmin) && (
                                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, comment.id)}>
                                            <MoreVertIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </Box>

                                {editingCommentId === comment.id ? (
                                    <Box>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={2}
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            sx={{ mb: 1 }}
                                        />
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button size="small" variant="contained" onClick={handleEditSave}>
                                                Save
                                            </Button>
                                            <Button size="small" onClick={handleEditCancel}>
                                                Cancel
                                            </Button>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {comment.content}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Paper>
                ))}
            </Box>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleEditStart}>
                    <EditIcon fontSize="small" sx={{ mr: 1 }} />
                    Edit
                </MenuItem>
                <MenuItem onClick={handleDeleteComment}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                    Delete
                </MenuItem>
            </Menu>
        </Box>
    );
}

export default TaskComments;
