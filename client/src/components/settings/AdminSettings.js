import React from 'react';
import { Box, Typography } from '@mui/material';
import UsersTable from './UsersTable';

function AdminSettings() {
    return (
        <Box>

        <Box sx={{ mt: -3 }}>
            <UsersTable />
        </Box>
        </Box>
    );
}

export default AdminSettings;
