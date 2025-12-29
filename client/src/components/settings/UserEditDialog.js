import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControlLabel,
    Switch,
    Typography,
    Divider,
} from '@mui/material';
import userService from '../../services/userService';

const initialUserState = {
    username: '',
    display_name: '',
    email: '',
    enabled: true,
};

function UserEditDialog({ open, user, onClose, onSave }) {
    const [editingUser, setEditingUser] = useState(initialUserState);
    const [newPassword, setNewPassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            setEditingUser({
                username: user.username || '',
                display_name: user.display_name || '',
                email: user.email || '',
                enabled: user.enabled ?? true,
            });
            setNewPassword('');
            setError(null);
        } else {
            setEditingUser(initialUserState);
            setNewPassword('');
            setError(null);
        }
    }, [user, open]);

    const handleEditChange = (field) => (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setEditingUser((prev) => ({ ...prev, [field]: value }));
    };

    const handleReset = () => {
        if (user) {
            setEditingUser({
                username: user.username || '',
                display_name: user.display_name || '',
                email: user.email || '',
                enabled: user.enabled ?? true,
            });
            setNewPassword('');
            setError(null);
        }
    };

    const isChanged = user && (
        editingUser.username !== (user.username || '') ||
        editingUser.display_name !== (user.display_name || '') ||
        editingUser.email !== (user.email || '') ||
        editingUser.enabled !== (user.enabled ?? true)
    );

    const isPasswordValid = newPassword.length === 0 || newPassword.length >= 6;
    const hasChanges = isChanged || newPassword.length > 0;
    const canSave = hasChanges && isPasswordValid && !!editingUser.username?.trim() && !!editingUser.email?.trim();

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            // Update profile fields
            const updatedUser = await userService.updateUserByAdmin(user.id, editingUser);

            // If a new password was provided, reset it
            if (newPassword.trim().length >= 6) {
                await userService.resetUserPasswordByAdmin(user.id, newPassword);
            } else if (newPassword.trim().length > 0) {
                throw new Error('Password must be at least 6 characters long.');
            }

            onSave(updatedUser);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to update user.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Edit User Record</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    {error && (
                        <Typography color="error" variant="body2">
                            {error}
                        </Typography>
                    )}
                    <TextField
                        label="Username"
                        value={editingUser.username}
                        onChange={handleEditChange('username')}
                        fullWidth
                        size="small"
                        disabled={user?.id === 1} // Protection for main admin
                    />
                    <TextField
                        label="Display Name"
                        value={editingUser.display_name}
                        onChange={handleEditChange('display_name')}
                        fullWidth
                        size="small"
                    />
                    <TextField
                        label="Email"
                        value={editingUser.email}
                        onChange={handleEditChange('email')}
                        fullWidth
                        size="small"
                    />
                    
                    <FormControlLabel
                        control={
                            <Switch
                                checked={editingUser.enabled}
                                onChange={handleEditChange('enabled')}
                                color="primary"
                                disabled={user?.id === 1}
                            />
                        }
                        label={editingUser.enabled ? 'Account Enabled' : 'Account Disabled'}
                    />

                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" color="textSecondary">
                        Reset Password
                    </Typography>
                    <TextField
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        fullWidth
                        size="small"
                        placeholder="Leave blank to keep current password"
                        helperText="Minimum 6 characters"
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button variant="outlined" onClick={onClose} disabled={saving}>
                    Cancel
                </Button>
                <Box sx={{ flexGrow: 1 }} />
                <Button 
                    variant="text" 
                    onClick={handleReset} 
                    disabled={saving || !hasChanges}
                    color="secondary"
                >
                    Reset Changes
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={saving || !canSave}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default UserEditDialog;
