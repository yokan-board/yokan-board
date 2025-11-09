import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    CircularProgress,
    Alert,
} from '@mui/material';
import { useThemeContext } from '../../contexts/ThemeContext';
import userService from '../../services/userService';

function PreferencesSettings() {
    const { mode, setMode } = useThemeContext();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        userService
            .getPreferences()
            .then((prefs) => {
                if (prefs && prefs.theme) {
                    setMode(prefs.theme);
                }
            })
            .catch(() => setError('Failed to load preferences.'))
            .finally(() => setLoading(false));
    }, [setMode]);

    const handleThemeChange = async (event) => {
        const newMode = event.target.value;
        setMode(newMode);
        setError('');
        setSuccess('');
        try {
            await userService.updatePreferences({ theme: newMode });
            setSuccess('Theme updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save theme preference.');
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
                Application Preferences
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            <Box sx={{ mt: 2 }}>
                <FormControl component="fieldset">
                    <FormLabel component="legend">Theme</FormLabel>
                    <RadioGroup row aria-label="theme" name="theme" value={mode} onChange={handleThemeChange}>
                        <FormControlLabel value="light" control={<Radio />} label="Light" />
                        <FormControlLabel value="dark" control={<Radio />} label="Dark" />
                    </RadioGroup>
                </FormControl>
            </Box>
        </Box>
    );
}

export default PreferencesSettings;
