import React from 'react';
import { Box, TextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import MarkdownEditor from '../components/MarkdownEditor';

function TaskForm({
    content,
    setContent,
    dueDate,
    setDueDate,
    description,
    setDescription,
    hasUnsavedChanges,
    onSave,
}) {
    return (
        <Box
            component="form"
            data-testid="task-form"
            onSubmit={onSave}
            sx={{ mt: 1, width: '100%', display: 'flex', flexDirection: 'column', flexGrow: 1 }}
        >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{ mb: 3 }}>
                    <DatePicker
                        label="Due Date"
                        value={dueDate ? dayjs(dueDate) : null}
                        onChange={(newValue) => {
                            setDueDate(newValue ? newValue.format('YYYY-MM-DD') : '');
                        }}
                        slots={{ textField: TextField }}
                        slotProps={{
                            textField: {
                                sx: { width: 220 },
                            },
                        }}
                        enableAccessibleFieldDOMStructure={false}
                    />
                </Box>
            </LocalizationProvider>
            <MarkdownEditor
                value={description}
                onChange={setDescription}
                placeholder="Description (Markdown)"
                sx={{ flexGrow: 1, mb: 3 }} // Allow MarkdownEditor to grow
            />
        </Box>
    );
}

export default TaskForm;
