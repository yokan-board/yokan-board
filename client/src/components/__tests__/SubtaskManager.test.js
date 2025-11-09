import React from 'react';
import { Box, TextField, Autocomplete, Chip, Tooltip } from '@mui/material';
import { marked } from 'marked';

const mockUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    useNavigate: () => mockUseNavigate,
}));

function MarkdownPreview({ markdown }) {
    const html = marked.parse(markdown || '');
    return <Box dangerouslySetInnerHTML={{ __html: html }} sx={{ p: 1, maxWidth: 300 }} />;
}

function SubtaskManager({
    subtasks,
    setSubtasks,
    availableTasks,
    currentTaskDescendants,
    currentTaskAncestors,
    parentId,
    taskId,
    allTasks,
    boardId,
}) {
    const navigate = mockUseNavigate;
}
