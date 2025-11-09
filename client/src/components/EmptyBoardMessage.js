import React, { useState } from 'react';
import { Box, Paper, FormControl, Select, MenuItem, Typography } from '@mui/material';

function EmptyBoardMessage({ onCreateFromTemplate }) {
    const [selectedTemplate, setSelectedTemplate] = useState('');

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4 }}>
            <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                <Typography variant="body1">
                    This board has no columns. Add columns by selecting one of the templates:
                </Typography>
                <FormControl fullWidth margin="dense" sx={{ mt: 2 }}>
                    <Select
                        value={selectedTemplate}
                        displayEmpty
                        onChange={(e) => {
                            setSelectedTemplate(e.target.value);
                            onCreateFromTemplate(e.target.value);
                        }}
                    >
                        <MenuItem value="" disabled>
                            Select a template
                        </MenuItem>
                        <MenuItem value="1 Column">1 Column</MenuItem>
                        <MenuItem value="Standard 3 columns">Standard 3 columns</MenuItem>
                        <MenuItem value="Standard 4 columns">Standard 4 columns</MenuItem>
                        <MenuItem value="Standard 5 columns">Standard 5 columns</MenuItem>
                    </Select>
                </FormControl>
            </Paper>
        </Box>
    );
}

export default EmptyBoardMessage;
