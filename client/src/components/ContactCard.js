import React, { useState } from 'react';
import { Box, Typography, IconButton, Card, CardContent, Tooltip, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import ContactInfo from './ContactInfo';

function ContactCard({ 
    contact, 
    onEdit, 
    onDelete, 
    dragHandleProps, 
    viewMode = 'card',
    isDeleteDisabled = false,
    deleteTooltip = '',
    tags = []
}) {
    const [copied, setCopied] = useState(false);

    const handleDelete = () => {
        onDelete(contact.id);
    };

    const handleCopy = async () => {
        const details = [
            contact.name,
            contact.title && contact.company 
                ? `${contact.title} at ${contact.company}` 
                : (contact.title || contact.company || ''),
            contact.email ? `Email: ${contact.email}` : '',
            contact.phone ? `Phone: ${contact.phone}` : ''
        ].filter(Boolean).join('\n');

        try {
            await navigator.clipboard.writeText(details);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
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
                display: 'flex',
                flexDirection: 'row',
                alignItems: isList ? 'center' : 'flex-start',
                gap: 2
            }}>
                <ContactInfo contact={contact} viewMode={viewMode} tags={tags} />
                
                {!isList && tags.length > 0 && (
                    <Box sx={{ 
                        position: 'absolute', 
                        bottom: 12, 
                        left: 16,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.5,
                        maxWidth: 'calc(100% - 100px)' // Leave room for status
                    }}>
                        {tags.map((tag) => (
                            <Chip 
                                key={tag} 
                                label={tag} 
                                size="small" 
                                color="primary" 
                                variant="outlined" 
                                sx={{ 
                                    height: '24px', 
                                    fontSize: '0.75rem',
                                    borderRadius: '4px'
                                }} 
                            />
                        ))}
                    </Box>
                )}

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
                    ml: 'auto',
                    gap: isList ? 1 : 0
                }}>
                    {dragHandleProps && (
                        <IconButton size="small" {...dragHandleProps} sx={{ cursor: 'grab' }}>
                            <DragHandleIcon fontSize="small" />
                        </IconButton>
                    )}
                    <Tooltip title={copied ? "Copied!" : "Copy details"}>
                        <IconButton size="small" onClick={handleCopy}>
                            {copied ? <CheckIcon fontSize="small" color="success" /> : <ContentCopyIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>
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
