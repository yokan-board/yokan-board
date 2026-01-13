import React, { useState, useEffect } from 'react';
import { Box, Typography, Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { useJournalData } from '../hooks/useJournalData';
import { useBoards } from '../contexts/BoardContext';
import JournalTaskItem from '../components/JournalTaskItem';
import dayjs from 'dayjs';

function JournalPage() {
    const { fetchBoards } = useBoards();
    const [selectedTab, setSelectedTab] = useState('tasks');
    const [expandedTaskId, setExpandedTaskId] = useState(null);
    const { overdue, today, upcoming, noDueDate } = useJournalData();

    // Ensure we have fresh data on mount (handles browser back button scenarios)
    useEffect(() => {
        fetchBoards();
    }, [fetchBoards]);

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    const handleToggleExpand = (taskId) => {
        setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
    };

    const renderTaskGroup = (title, tasks, titleColor = 'text.primary') => {
        if (!tasks || tasks.length === 0) return null;

        return (
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ color: titleColor }}>
                    {title}
                </Typography>
                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                    {tasks.map((task) => (
                        <JournalTaskItem
                            key={task.id}
                            task={task}
                            isExpanded={expandedTaskId === task.id}
                            onToggleExpand={() => handleToggleExpand(task.id)}
                        />
                    ))}
                </Box>
            </Box>
        );
    };

    const hasAnyTasks =
        overdue.length > 0 || today.length > 0 || upcoming.length > 0 || noDueDate.length > 0;

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
                        <Tab label="Tasks" value="tasks" />
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
                <TabPanel value="tasks" sx={{ p: 0, pt: 3 }}>
                    {!hasAnyTasks ? (
                        <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                            No active tasks found across your boards.
                        </Typography>
                    ) : (
                        <>
                            {renderTaskGroup('Overdue', overdue, 'error.main')}
                            {renderTaskGroup('Today', today, 'primary.main')}
                            {upcoming.map((group) =>
                                renderTaskGroup(dayjs(group.date).format('dddd, MMM D, YYYY'), group.tasks)
                            )}
                            {renderTaskGroup('No Due Date', noDueDate, 'text.secondary')}
                        </>
                    )}
                </TabPanel>
                <TabPanel value="settings" sx={{ p: 2 }}>
                    <Typography color="text.secondary">Journal settings will be available in a future update.</Typography>
                </TabPanel>
            </TabContext>
        </Box>
    );
}

export default JournalPage;
