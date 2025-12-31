import React, { useState } from 'react';
import { Box, Typography, Tab, Tabs, Divider } from '@mui/material';
import ProfileSettings from '../components/settings/ProfileSettings';
import PasswordSettings from '../components/settings/PasswordSettings';
import PreferencesSettings from '../components/settings/PreferencesSettings';
import ContactsSettings from '../components/settings/ContactsSettings';
import AdminSettings from '../components/settings/AdminSettings';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

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
    const { user } = useAuth(); // Use AuthContext
    const [value, setValue] = useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    // If the ADMIN tab was selected and the user is no longer admin, switch to the first tab.
    // This handles cases where a non-admin user might navigate directly to the admin tab index.
    React.useEffect(() => {
        if (value === 3 && (!user || user.id !== 1)) {
            setValue(0);
        }
    }, [value, user]);

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h4" component="h1" sx={{ p: 3, pb: 0 }}>
                Settings
            </Typography>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="settings tabs">
                    <Tab label="Profile" {...a11yProps(0)} />
                    <Tab label="Contacts" {...a11yProps(1)} />
                    <Tab label="Preferences" {...a11yProps(2)} />
                    {user && user.id === 1 && <Tab label="ADMIN" {...a11yProps(3)} />}
                </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
                <ProfileSettings />
                <Divider sx={{ my: 4 }} />
                <PasswordSettings />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <ContactsSettings />
            </TabPanel>
            <TabPanel value={value} index={2}>
                <PreferencesSettings />
            </TabPanel>
            {user && user.id === 1 && (
                <TabPanel value={value} index={3}>
                    <AdminSettings />
                </TabPanel>
            )}
        </Box>
    );
}

export default AccountPage;
