import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Alert, Avatar } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import userService from '../../services/userService';
import { getGravatarUrl } from '../../utils/gravatar';

function ProfileSettings() {
    const { user, updateUser } = useAuth();
    const [displayName, setDisplayName] = useState(user?.display_name || user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
    const [loading, setLoading] = useState(false); // No longer need to load user data here
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [hasChanges, setHasChanges] = useState(false);

    // If user is not in context, try fetching from API (this case should be rare after login fix)
    useEffect(() => {
        if (!user) {
            setLoading(true);
            userService
                .getUserProfile()
                .then((profile) => {
                    updateUser(profile);
                    setDisplayName(profile.display_name || profile.username);
                    setEmail(profile.email || '');
                    setAvatarUrl(profile.avatar_url || '');
                })
                .catch(() => setError('Failed to load profile.'))
                .finally(() => setLoading(false));
        }
    }, [user, updateUser]);

    useEffect(() => {
        if (user) {
            const nameChanged = displayName !== (user.display_name || user.username);
            const emailChanged = email !== (user.email || '');
            const avatarChanged = avatarUrl !== (user.avatar_url || '');
            setHasChanges(nameChanged || emailChanged || avatarChanged);
        }
    }, [displayName, email, avatarUrl, user]);

    const handleSave = async () => {
        setError('');
        setSuccess('');
        try {
            const updatedProfile = await userService.updateUserProfile({
                display_name: displayName,
                email: email,
                avatar_url: avatarUrl,
            });
            updateUser(updatedProfile);
            setSuccess('Profile updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile.');
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
                Profile Information
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            <Box sx={{ maxWidth: 500 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                    <Avatar src={avatarUrl || getGravatarUrl(email)} sx={{ width: 64, height: 64 }} />
                    <Box>
                        <Typography variant="body2" color="textSecondary">
                            Your avatar is automatically fetched from Gravatar based on your email address, unless you
                            provide a custom URL below.
                        </Typography>
                    </Box>
                </Box>
                <Box component="form" noValidate autoComplete="off" sx={{ mt: 2 }}>
                    <TextField
                        label="Username"
                        value={user?.username || ''}
                        fullWidth
                        margin="normal"
                        InputProps={{
                            readOnly: true,
                        }}
                        variant="filled"
                    />
                    <TextField
                        label="Display Name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Avatar URL"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        fullWidth
                        margin="normal"
                        placeholder="Leave blank to use Gravatar"
                    />
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="contained" onClick={handleSave} disabled={!hasChanges}>
                            Save Profile
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default ProfileSettings;
