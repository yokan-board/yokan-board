import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Alert, TextField, Select, MenuItem } from '@mui/material';

import boardService from '../services/boardService';
import TaskForm from '../components/TaskForm';
import SubtaskManager from '../components/SubtaskManager';
import ParentTaskDisplay from '../components/ParentTaskDisplay';
import { useTaskRelationships } from '../hooks/useTaskRelationships';

function EditTaskPage() {
    const { boardId, taskId } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [content, setContent] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [description, setDescription] = useState('');
    const [subtasks, setSubtasks] = useState([]);
    const [allTasks, setAllTasks] = useState([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isEditingTaskTitle, setIsEditingTaskTitle] = useState(false);
    const [boardName, setBoardName] = useState('');
    const [columns, setColumns] = useState([]);
    const [originalColumnId, setOriginalColumnId] = useState(null);
    const [selectedColumnId, setSelectedColumnId] = useState(null);

    const { allTasksWithDynamicParentId, currentTaskDescendants, currentTaskAncestors } = useTaskRelationships(
        taskId,
        allTasks,
        subtasks
    );

    const fetchTaskData = useCallback(async () => {
        try {
            setLoading(true);
            setHasUnsavedChanges(false); // Reset unsaved changes flag
            const board = await boardService.getBoard(boardId);
            if (board && board.data && board.data.columns) {
                setBoardName(board.name);
                setColumns(Object.values(board.data.columns));

                const allTasksWithColors = Object.values(board.data.columns).flatMap((column) =>
                    column.tasks.map((t) => ({ ...t, highlightColor: column.highlightColor }))
                );
                const foundTask = allTasksWithColors.find((t) => t.id === taskId);

                let foundColumnId = null;
                for (const colId in board.data.columns) {
                    const column = board.data.columns[colId];
                    if (column.tasks.some((t) => t.id === taskId)) {
                        foundColumnId = colId;
                        break;
                    }
                }

                if (foundColumnId) {
                    setOriginalColumnId(foundColumnId);
                    setSelectedColumnId(foundColumnId);
                }

                setAllTasks(allTasksWithColors);

                if (foundTask) {
                    setTask(foundTask);
                    setContent(foundTask.content || '');
                    setDueDate(foundTask.dueDate ? foundTask.dueDate.split('T')[0] : '');
                    setDescription(foundTask.description || '');
                    setSubtasks(foundTask.subtasks || []);
                } else {
                    setError('Task not found');
                }
            } else {
                setError('Board not found or invalid data');
            }
        } catch (err) {
            console.error('Error fetching task:', err);
            setError('Failed to load task');
        } finally {
            setLoading(false);
        }
    }, [boardId, taskId]);

    useEffect(() => {
        fetchTaskData();
    }, [fetchTaskData]);

    useEffect(() => {
        if (task) {
            const initialContent = task.content || '';
            const initialDueDate = task.dueDate ? task.dueDate.split('T')[0] : '';
            const initialDescription = task.description || '';
            const initialSubtasks = task.subtasks || [];

            const contentChanged = initialContent !== content;
            const dueDateChanged = initialDueDate !== dueDate;
            const descriptionChanged = initialDescription !== description;
            const subtasksChanged = JSON.stringify(initialSubtasks.sort()) !== JSON.stringify(subtasks.sort());
            const columnChanged = originalColumnId !== selectedColumnId;

            setHasUnsavedChanges(
                contentChanged || dueDateChanged || descriptionChanged || subtasksChanged || columnChanged
            );
        }
    }, [content, dueDate, description, subtasks, task, originalColumnId, selectedColumnId]);

    const handleSave = async (event) => {
        if (event) event.preventDefault();
        setError(null);

        if (!task) return;

        try {
            const board = await boardService.getBoard(boardId);
            if (board && board.data && board.data.columns) {
                const updatedBoardData = { ...board.data };
                let taskToMove = null;

                // Update task details and handle moving columns
                if (originalColumnId !== selectedColumnId) {
                    // Find and remove the task from the original column
                    if (updatedBoardData.columns[originalColumnId]) {
                        const taskIndex = updatedBoardData.columns[originalColumnId].tasks.findIndex(
                            (t) => t.id === taskId
                        );
                        if (taskIndex > -1) {
                            [taskToMove] = updatedBoardData.columns[originalColumnId].tasks.splice(taskIndex, 1);
                        }
                    }
                }

                // Update the task's main properties (content, dueDate, etc.)
                const updatedTask = {
                    ...(taskToMove || task),
                    content: content,
                    dueDate: dueDate || null,
                    description: description,
                    subtasks: subtasks,
                };

                // Add the task to the new column or update it in the original column
                if (selectedColumnId && updatedBoardData.columns[selectedColumnId]) {
                    if (originalColumnId !== selectedColumnId) {
                        updatedBoardData.columns[selectedColumnId].tasks.push(updatedTask);
                    } else {
                        // Task is in the same column, just update it
                        const taskIndex = updatedBoardData.columns[selectedColumnId].tasks.findIndex(
                            (t) => t.id === taskId
                        );
                        if (taskIndex > -1) {
                            updatedBoardData.columns[selectedColumnId].tasks[taskIndex] = updatedTask;
                        }
                    }
                }

                // Update parentId for subtasks
                const previousSubtasks = task.subtasks || [];
                const newSubtasks = subtasks;
                const addedSubtasks = newSubtasks.filter((subId) => !previousSubtasks.includes(subId));
                const removedSubtasks = previousSubtasks.filter((subId) => !newSubtasks.includes(subId));

                for (const columnId in updatedBoardData.columns) {
                    updatedBoardData.columns[columnId].tasks = updatedBoardData.columns[columnId].tasks.map((t) => {
                        if (addedSubtasks.includes(t.id)) {
                            return { ...t, parentId: taskId };
                        }
                        if (removedSubtasks.includes(t.id)) {
                            return { ...t, parentId: null };
                        }
                        return t;
                    });
                }

                await boardService.updateBoard(boardId, board.name, updatedBoardData);
                fetchTaskData(); // Refresh data to reflect saved state
            } else {
                setError('Board not found or invalid data for update.');
            }
        } catch (err) {
            console.error('Error saving task:', err);
            setError('Failed to save task');
        }
    };

    const handleClearChanges = () => {
        fetchTaskData();
    };

    const handleNavigation = (path) => {
        if (hasUnsavedChanges) {
            const confirmNavigation = window.confirm(
                'You have unsaved changes. Are you sure you want to leave this page?'
            );
            if (confirmNavigation) {
                navigate(path);
            }
        } else {
            navigate(path);
        }
    };

    const handleTitleBlur = () => {
        if (content.trim() !== '' && content !== task?.content) {
            handleSave();
        } else {
            setContent(task?.content || ''); // Revert if empty or unchanged
        }
        setIsEditingTaskTitle(false);
    };

    const handleTitleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleTitleBlur();
        }
    };

    const parentTaskObject = allTasks.find((t) => t.id === task?.parentId);
    const availableTasks = allTasksWithDynamicParentId.filter((t) => t.id !== taskId);

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h6">
                        <Link to={`/board/${boardId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            {boardName}
                        </Link>
                    </Typography>
                    <Select
                        value={selectedColumnId || ''}
                        onChange={(e) => setSelectedColumnId(e.target.value)}
                        variant="standard"
                        sx={{
                            ml: 2,
                            '& .MuiSelect-select': {
                                display: 'flex',
                                alignItems: 'center',
                                paddingRight: '24px !important',
                            },
                            '&:before': {
                                border: 'none',
                            },
                            '&:hover:not(.Mui-disabled):before': {
                                border: 'none',
                            },
                            fontSize: '1.25rem', // h6 variant
                            fontWeight: 'bold',
                        }}
                    >
                        {columns.map((col) => (
                            <MenuItem key={col.id} value={col.id}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box
                                        sx={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: '50%',
                                            backgroundColor: col.highlightColor || 'grey.400',
                                            mr: 1,
                                        }}
                                    />
                                    {col.title}
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                    <Box sx={{ flexGrow: 1 }} />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="outlined" onClick={handleClearChanges} disabled={!hasUnsavedChanges}>
                            Clear Changes
                        </Button>
                        <Button variant="contained" onClick={handleSave} disabled={!hasUnsavedChanges}>
                            Save Changes
                        </Button>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" sx={{ mr: 1, color: 'text.secondary' }}>
                        #{task?.displayId}:
                    </Typography>
                    <TextField
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onBlur={handleTitleBlur}
                        onKeyPress={handleTitleKeyPress}
                        onClick={() => {
                            if (!isEditingTaskTitle) {
                                setIsEditingTaskTitle(true);
                            }
                        }}
                        variant="standard"
                        fullWidth
                        autoFocus={isEditingTaskTitle}
                        InputProps={{
                            readOnly: !isEditingTaskTitle,
                            disableUnderline: true,
                        }}
                        sx={{
                            flexGrow: 1,
                            '& .MuiInputBase-input': {
                                padding: '4px 0',
                                fontSize: '2.125rem',
                                lineHeight: 1.235, // Match h4
                                cursor: isEditingTaskTitle ? 'text' : 'pointer',
                            },
                            // Hide the blinking cursor when not editing (readOnly)
                            '& .MuiInputBase-input:read-only': {
                                caretColor: 'transparent',
                            },
                        }}
                    />
                </Box>
                {loading ? (
                    <CircularProgress />
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : (
                    <>
                        <Box sx={{ mb: 3 }}>
                            <TaskForm
                                content={content}
                                setContent={setContent}
                                dueDate={dueDate}
                                setDueDate={setDueDate}
                                description={description}
                                setDescription={setDescription}
                                hasUnsavedChanges={hasUnsavedChanges}
                                onSave={handleSave}
                            />
                        </Box>
                        <Box sx={{ mb: 3 }}>
                            <ParentTaskDisplay parentTaskObject={parentTaskObject} boardId={boardId} />
                        </Box>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Subtasks
                            </Typography>
                            <SubtaskManager
                                subtasks={subtasks}
                                setSubtasks={setSubtasks}
                                availableTasks={availableTasks}
                                currentTaskDescendants={currentTaskDescendants}
                                currentTaskAncestors={currentTaskAncestors}
                                parentId={task?.parentId}
                                taskId={taskId}
                                allTasks={allTasks}
                                boardId={boardId}
                                onNavigate={handleNavigation}
                            />
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
}

export default EditTaskPage;
