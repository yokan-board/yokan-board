import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { getGravatarUrl } from '../utils/gravatar';

function ContactInfo({ contact, viewMode = 'card' }) {
    const isList = viewMode === 'list';
    
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1, overflow: 'hidden' }}>
            <Avatar
                src={contact.avatarUrl || getGravatarUrl(contact.email)}
                sx={{ width: isList ? 40 : 56, height: isList ? 40 : 56 }}
            />
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontSize: isList ? '1rem' : '1.25rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                    {contact.name}
                    {isList && (
                        <>
                            {contact.email && (
                                <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1, opacity: 0.6, whiteSpace: 'nowrap' }}>
                                    / {contact.email}
                                </Typography>
                            )}
                            {contact.phone && (
                                <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1, opacity: 0.6, whiteSpace: 'nowrap' }}>
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
    );
}

export default ContactInfo;
