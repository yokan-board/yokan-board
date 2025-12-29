import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Alert,
    Switch,
    Avatar, // Import Avatar
} from '@mui/material';
import userService from '../../services/userService';
import dayjs from 'dayjs';
import { getGravatarUrl } from '../../utils/gravatar';
import UserEditDialog from './UserEditDialog';

function UsersTable() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const fetchedUsers = await userService.getUsers();
                setUsers(fetchedUsers);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch users.');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    const handleRowClick = (user) => {
        setSelectedUser(user);
        setIsDialogOpen(true);
    };

    const handleSaveUser = (updatedUser) => {
        setUsers((prevUsers) =>
            prevUsers.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
        );
    };

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
                Users
            </Typography>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="users table">
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>USERNAME</TableCell>
                            <TableCell>DISPLAY NAME</TableCell>
                            <TableCell>EMAIL</TableCell>
                            <TableCell>ROLE</TableCell>
                            <TableCell>ENABLED</TableCell>
                            <TableCell>LAST LOGIN</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow
                                key={user.id}
                                hover
                                onClick={() => handleRowClick(user)}
                                sx={{ cursor: 'pointer' }}
                            >
                                <TableCell>{user.id}</TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Avatar
                                            src={getGravatarUrl(user.email, 24)} // Adjust size as needed
                                            alt={user.username}
                                            sx={{ width: 24, height: 24, mr: 2 }}
                                        />
                                        {user.username}
                                    </Box>
                                </TableCell>
                                <TableCell>{user.display_name || user.username}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.id === 1 ? 'ADMIN' : 'USER'}</TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <Switch
                                        checked={user.enabled}
                                        onChange={async (event) => {
                                            const newEnabledStatus = event.target.checked;
                                            try {
                                                await userService.updateUserEnabledStatus(user.id, newEnabledStatus);
                                                setUsers((prevUsers) =>
                                                    prevUsers.map((u) =>
                                                        u.id === user.id ? { ...u, enabled: newEnabledStatus } : u
                                                    )
                                                );
                                                // Clear any previous errors if successful
                                                setError(null);
                                            } catch (err) {
                                                setError(err.response?.data?.message || 'Failed to update user status.');
                                            }
                                        }}
                                        disabled={user.id === 1} // Disable for admin user
                                    />
                                </TableCell>
                                <TableCell>
                                    {user.last_login ? dayjs(user.last_login).format('YYYY-MM-DD HH:mm') : 'N/A'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <UserEditDialog
                open={isDialogOpen}
                user={selectedUser}
                onClose={() => setIsDialogOpen(false)}
                onSave={handleSaveUser}
            />
        </Box>
    );
}

export default UsersTable;
