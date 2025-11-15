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
    Switch,
    FormGroup,
} from '@mui/material';
import { useThemeContext } from '../../contexts/ThemeContext';
import userService from '../../services/userService';

function PreferencesSettings() {
    const { mode, setMode } = useThemeContext();
    const [hideUnnamedCollectionHeading, setHideUnnamedCollectionHeading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        userService
            .getPreferences()
            .then((prefs) => {
                if (prefs) {
                    if (prefs.theme) {
                        setMode(prefs.theme);
                    }
                    if (typeof prefs.hideUnnamedCollectionHeading !== 'undefined') {
                        setHideUnnamedCollectionHeading(prefs.hideUnnamedCollectionHeading);
                    }
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

    const handleHideUnnamedCollectionHeadingChange = async (event) => {
        const newValue = event.target.checked;
        setHideUnnamedCollectionHeading(newValue);
        setError('');
        setSuccess('');
        try {
            await userService.updatePreferences({ hideUnnamedCollectionHeading: newValue });
            setSuccess('Preference updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save preference.');
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
            <Box sx={{ mt: 2 }}>
                <FormGroup>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={hideUnnamedCollectionHeading}
                                onChange={handleHideUnnamedCollectionHeadingChange}
                                name="hideUnnamedCollectionHeading"
                            />
                        }
                        label="Hide unnamed collection heading label"
                    />
                </FormGroup>
            </Box>
        </Box>
    );
}

export default PreferencesSettings;
