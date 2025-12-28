import React from 'react';
import { Box, Typography, IconButton, Avatar, Card, CardContent } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { getGravatarUrl } from '../utils/gravatar';

function ContactCard({ contact, onEdit, onDelete, dragHandleProps, viewMode = 'card' }) {
    const handleDelete = () => {
        onDelete(contact.id);
    };

    const isInactive = contact.status === 'INACTIVE';
    const isList = viewMode === 'list';

    return (
        <Card sx={{ 
            width: isList ? '100%' : '24rem', 
            height: isList ? 'auto' : '14.8rem', 
            flexShrink: 0, 
            mb: 2, 
            opacity: isInactive ? 0.6 : 1, 
            transition: 'opacity 0.3s',
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
                overflowY: isList ? 'hidden' : 'auto',
                p: isList ? '8px 16px !important' : undefined,
                display: isList ? 'flex' : 'block',
                alignItems: 'center',
                gap: 2
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
                    <Avatar
                        src={contact.avatarUrl || getGravatarUrl(contact.email)}
                        sx={{ width: isList ? 40 : 56, height: isList ? 40 : 56 }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontSize: isList ? '1rem' : '1.25rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                            {contact.name}
                            {isList && (
                                <>
                                    {contact.email && (
                                        <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1, opacity: 0.6 }}>
                                            / {contact.email}
                                        </Typography>
                                    )}
                                    {contact.phone && (
                                        <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1, opacity: 0.6 }}>
                                            / {contact.phone}
                                        </Typography>
                                    )}
                                </>
                            )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom={!isList}>
                            {contact.title} {contact.title && contact.company ? 'at' : ''} {contact.company}
                        </Typography>
                        {!isList && (
                            <Box sx={{ mt: 1 }}>
                                {contact.email && (
                                    <Typography variant="body2" color="text.primary">
                                        {contact.email}
                                    </Typography>
                                )}
                                {contact.phone && (
                                    <Typography variant="body2" color="text.primary">
                                        {contact.phone}
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Box>
                </Box>
                
                <Box sx={{ 
                    position: isList ? 'static' : 'absolute', 
                    bottom: isList ? 'auto' : 12, 
                    right: isList ? 'auto' : 16,
                    display: 'flex',
                    alignItems: 'center',
                    minWidth: isList ? '80px' : 'auto',
                    justifyContent: isList ? 'center' : 'flex-start',
                    ml: isList ? 2 : 0
                }}>
                    <Typography variant="caption" sx={{
                        color: isInactive ? 'text.disabled' : 'success.main',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                    }}>
                        {contact.status}
                    </Typography>
                </Box>

                <Box className="action-buttons" sx={{ 
                    display: 'flex', 
                    flexDirection: isList ? 'row' : 'column',
                    visibility: 'hidden',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    ml: isList ? 2 : 0,
                    gap: isList ? 1 : 0
                }}>
                    {dragHandleProps && (
                        <IconButton size="small" {...dragHandleProps} sx={{ cursor: 'grab' }}>
                            <DragHandleIcon fontSize="small" />
                        </IconButton>
                    )}
                    <IconButton size="small" onClick={() => onEdit(contact)}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={handleDelete}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            </CardContent>
        </Card>
    );
}

export default ContactCard;
