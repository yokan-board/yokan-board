import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';

function BoardSettingsPage({ boardData, onSaveBoard }) {
    const theme = useTheme();
    const [orgShortName, setOrgShortName] = useState('');
    const [orgFullName, setOrgFullName] = useState('');
    const [orgUrl, setOrgUrl] = useState('');
    const [orgLogo, setOrgLogo] = useState('');
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (boardData) {
            const org = boardData.org || {};
            setOrgShortName(org.short_name || '');
            setOrgFullName(org.full_name || '');
            setOrgUrl(org.url || '');
            setOrgLogo(org.logo || '');
        }
        setHasChanges(false);
    }, [boardData]);

    useEffect(() => {
        if (!boardData) return;
        const org = boardData.org || {};
        const changed =
            (org.short_name || '') !== orgShortName ||
            (org.full_name || '') !== orgFullName ||
            (org.url || '') !== orgUrl ||
            (org.logo || '') !== orgLogo;
        setHasChanges(changed);
    }, [orgShortName, orgFullName, orgUrl, orgLogo, boardData]);

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setOrgLogo(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveChanges = () => {
        const orgData = {
            short_name: orgShortName,
            full_name: orgFullName,
            url: orgUrl,
            logo: orgLogo,
        };

        const hasOrgData = Object.values(orgData).some((val) => val);

        const updatedData = {
            ...boardData,
            org: hasOrgData ? orgData : undefined,
        };

        onSaveBoard(updatedData);
        setHasChanges(false);
    };

    return (
        <Box sx={{ p: 3 }}>

            
            <Box>
                <Typography variant="h6" gutterBottom>
                    Organization
                </Typography>
                <Box sx={{ maxWidth: 500 }}>
                    <TextField
                        margin="dense"
                        label="Short Name"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={orgShortName}
                        onChange={(e) => setOrgShortName(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Full Name"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={orgFullName}
                        onChange={(e) => setOrgFullName(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="URL"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={orgUrl}
                        onChange={(e) => setOrgUrl(e.target.value)}
                    />
                    <Box // Main container for logo display and controls
                        sx={{
                            mt: 2,
                            display: 'flex',
                            flexDirection: 'column', // Stack vertically
                            alignItems: 'flex-start', // Change this from 'center' to 'flex-start'
                            gap: 2,
                            mb: 2, // Margin bottom before next section
                        }}
                    >
                        {/* Logo Placeholder / Display */}
                        <Box
                            sx={{
                                width: 400, // Max allowed resolution
                                height: 400, // Max allowed resolution
                                border: '1px dashed #ccc', // Placeholder border
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                overflow: 'hidden', // Hide overflow if image is too large but not scaled down
                                backgroundColor: theme.palette.background.paper, // Light background for placeholder
                            }}
                        >
                            {orgLogo ? (
                                <img
                                    src={orgLogo}
                                    alt="Organization Logo"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain', // Keep aspect ratio
                                    }}
                                />
                            ) : (
                                <Typography variant="caption" color="text.secondary">
                                    No Logo (400x400 px PNG)
                                </Typography>
                            )}
                        </Box>

                        {/* Buttons for Upload and Clear */}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button variant="outlined" component="label">
                                Upload Logo
                                <input type="file" hidden accept="image/png" onChange={handleLogoChange} />
                            </Button>
                            <Button variant="text" onClick={() => setOrgLogo('')} disabled={!orgLogo}>
                                Clear Logo
                            </Button>
                        </Box>
                    </Box>
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="contained" onClick={handleSaveChanges} disabled={!hasChanges}>
                            Save Organization
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default BoardSettingsPage;
