import React from 'react';
import { Box, Typography } from '@mui/material';

function BoardSettingsPage() {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5">Board Settings</Typography>
            <Typography variant="body1">
                This is where the board settings will be managed.
            </Typography>
        </Box>
    );
}

export default BoardSettingsPage;
