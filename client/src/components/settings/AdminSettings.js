import React from 'react';
import { Box, Typography } from '@mui/material';
import UsersTable from './UsersTable';

function AdminSettings() {
    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Admin Settings
            </Typography>
            <Typography variant="body1">
                Admin features will be added here in the future.
            </Typography>
            <UsersTable />
        </Box>
    );
}

export default AdminSettings;
