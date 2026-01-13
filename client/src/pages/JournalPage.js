import React, { useState } from 'react';
import { Box, Typography, Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';

function JournalPage() {
    const [selectedTab, setSelectedTab] = useState('activities');

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    Kanban Journal
                </Typography>
            </Box>

            <TabContext value={selectedTab}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex' }}>
                    <TabList onChange={handleTabChange} aria-label="journal tabs" sx={{ flexGrow: 1 }}>
                        <Tab label="Activities" value="activities" />
                        <Tab
                            label="Settings"
                            value="settings"
                            sx={{
                                marginLeft: 'auto',
                                '&.Mui-selected': {
                                    color: 'primary.main',
                                },
                            }}
                        />
                    </TabList>
                </Box>
                <TabPanel value="activities" sx={{ p: 2 }}>
                    <Typography>Activities will be listed here.</Typography>
                </TabPanel>
                <TabPanel value="settings" sx={{ p: 2 }}>
                    <Typography>Settings will be here.</Typography>
                </TabPanel>
            </TabContext>
        </Box>
    );
}

export default JournalPage;
