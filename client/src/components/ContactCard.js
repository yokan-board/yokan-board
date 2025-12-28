import React from 'react';
import { Box, Typography, IconButton, Card, CardContent, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import ContactInfo from './ContactInfo';

function ContactCard({ 
    contact, 
    onEdit, 
    onDelete, 
    dragHandleProps, 
    viewMode = 'card',
    isDeleteDisabled = false,
    deleteTooltip = ''
}) {
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
                <ContactInfo contact={contact} viewMode={viewMode} />
                
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
                    <Tooltip title={deleteTooltip}>
                        <span>
                            <IconButton 
                                size="small" 
                                onClick={handleDelete}
                                disabled={isDeleteDisabled}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Box>
            </CardContent>
        </Card>
    );
}

export default ContactCard;
