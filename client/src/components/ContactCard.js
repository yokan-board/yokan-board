import React from 'react';
import { Box, Typography, IconButton, Avatar, Card, CardContent } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { getGravatarUrl } from '../utils/gravatar';

function ContactCard({ contact, onEdit, onDelete, dragHandleProps }) {
    const handleDelete = () => {
        onDelete(contact.id);
    };

    const isInactive = contact.status === 'INACTIVE';

    return (
        <Card sx={{ 
            width: '24rem', 
            height: '14.8rem', 
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
            <CardContent sx={{ flexGrow: 1, overflowY: 'auto' }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Avatar
                        src={contact.avatarUrl || getGravatarUrl(contact.email)}
                        sx={{ width: 56, height: 56 }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6">{contact.name}</Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            {contact.title} {contact.title && contact.company ? 'at' : ''} {contact.company}
                        </Typography>
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
                    </Box>
                    <Box className="action-buttons" sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        visibility: 'hidden',
                        opacity: 0,
                        transition: 'opacity 0.2s'
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
                </Box>
                <Box sx={{ 
                    position: 'absolute', 
                    bottom: 12, 
                    right: 16,
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <Typography variant="caption" sx={{
                        color: isInactive ? 'text.disabled' : 'success.main',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                    }}>
                        {contact.status}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}

export default ContactCard;
