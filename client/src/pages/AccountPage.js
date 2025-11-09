import React, { useState } from 'react';
import { Box, Typography, Tab, Tabs, Divider } from '@mui/material';
import ProfileSettings from '../components/settings/ProfileSettings';
import PasswordSettings from '../components/settings/PasswordSettings';
import PreferencesSettings from '../components/settings/PreferencesSettings';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

function AccountPage() {
    const [value, setValue] = useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h4" component="h1" sx={{ p: 3, pb: 0 }}>
                Account Settings
            </Typography>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="account settings tabs">
                    <Tab label="Profile" {...a11yProps(0)} />
                    <Tab label="Preferences" {...a11yProps(1)} />
                </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
                <ProfileSettings />
                <Divider sx={{ my: 4 }} />
                <PasswordSettings />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <PreferencesSettings />
            </TabPanel>
        </Box>
    );
}

export default AccountPage;
