import React, { useState, useEffect, useRef } from 'react';
import { TextField, Box, Paper, Tabs, Tab, Typography } from '@mui/material';
import { marked } from 'marked';
import { useTheme } from '@mui/material/styles';

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
            {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

function MarkdownEditor({ value, onChange, placeholder }) {
    const [markdown, setMarkdown] = useState(value);
    const [html, setHtml] = useState('');
    const theme = useTheme();
    const previewRef = useRef(null);
    const [tabValue, setTabValue] = useState(0); // 0 for Write, 1 for Preview

    useEffect(() => {
        setMarkdown(value);
    }, [value]);

    useEffect(() => {
        const renderMarkdown = async () => {
            const renderedHtml = await marked.parse(markdown);
            setHtml(renderedHtml);
            if (previewRef.current) {
                previewRef.current.scrollTop = previewRef.current.scrollHeight;
            }
        };
        renderMarkdown();
    }, [markdown]);

    const handleChange = (e) => {
        setMarkdown(e.target.value);
        if (onChange) {
            onChange(e.target.value);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
                Description
            </Typography>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="markdown editor tabs">
                    <Tab label="Write" {...a11yProps(0)} />
                    <Tab label="Preview" {...a11yProps(1)} />
                </Tabs>
            </Box>
            <TabPanel value={tabValue} index={0}>
                <TextField
                    multiline
                    minRows={5}
                    fullWidth
                    variant="outlined"
                    value={markdown}
                    onChange={handleChange}
                    sx={{ '& .MuiInputBase-root': { height: '100%', alignItems: 'flex-start' } }}
                    InputProps={{
                        sx: { fontFamily: 'monospace', overflow: 'auto' },
                    }}
                    InputLabelProps={{
                        sx: { zIndex: 1 },
                    }}
                />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        overflow: 'auto',
                        flexGrow: 1,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: '4px',
                        backgroundColor: theme.palette.mode === 'dark' ? 'white' : theme.palette.background.paper,
                        color: theme.palette.mode === 'dark' ? 'black' : theme.palette.text.primary,
                    }}
                >
                    <Box
                        ref={previewRef}
                        dangerouslySetInnerHTML={{ __html: html }}
                        sx={{
                            overflow: 'auto',
                            height: '100%',
                            '&::-webkit-scrollbar': {
                                display: 'none',
                            },
                            scrollbarWidth: 'none',
                        }}
                    />
                </Paper>
            </TabPanel>
        </Box>
    );
}

export default MarkdownEditor;
