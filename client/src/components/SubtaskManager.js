import { Box, TextField, Autocomplete, Tooltip, Typography, IconButton } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { useNavigate } from 'react-router-dom';
import { marked } from 'marked';

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
    const navigate = useNavigate();

    const selectedSubtasks = allTasks.filter((t) => subtasks.includes(t.id));

    return (
        <>
            <Autocomplete
                multiple
                id="subtasks-autocomplete"
                options={availableTasks.filter(
                    (t) =>
                        !subtasks.includes(t.id) &&
                        t.id !== parentId &&
                        (t.parentId === null || t.parentId === taskId) &&
                        !currentTaskDescendants.has(t.id) &&
                        !currentTaskAncestors.has(t.id)
                )}
                getOptionLabel={(option) => `${option.content} (#${option.displayId})`}
                value={selectedSubtasks}
                onChange={(event, newValue) => {
                    const newSubtaskIds = newValue.map((t) => t.id);
                    setSubtasks(newSubtaskIds);
                }}
                renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Select subtasks" />}
                renderTags={() => []}
                renderOption={({ key, ...props }, option) => (
                    <li key={key} {...props}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                                sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    backgroundColor: option.highlightColor || 'grey.400',
                                    mr: 1,
                                }}
                            />
                            {`${option.content} (#${option.displayId})`}
                        </Box>
                    </li>
                )}
                sx={{ mt: 1 }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, mt: 2 }}>
                {selectedSubtasks.map((task, index) => (
                    <Box
                        key={task.id}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            p: 1.5,
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: 'action.hover',
                                '& .delete-button': {
                                    visibility: 'visible',
                                    opacity: 1,
                                },
                            },
                            borderBottom: index < selectedSubtasks.length - 1 ? '1px solid' : 'none',
                            borderColor: 'divider',
                        }}
                        onClick={() => navigate(`/task/edit/${boardId}/${task.id}`)}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                            <Box
                                sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    backgroundColor: task.highlightColor || 'grey.400',
                                    mr: 1.5,
                                    mt: 0.5, // Align with text
                                    flexShrink: 0,
                                }}
                            />
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'text.secondary',
                                    width: '50px',
                                    flexShrink: 0,
                                    mr: 1,
                                    mt: '1px', // Align with title
                                }}
                            >
                                #{task.displayId}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                    {task.content}
                                </Typography>
                                {task.description && (
                                    <Tooltip
                                        title={<MarkdownPreview markdown={task.description} />}
                                        placement="bottom-start"
                                    >
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'text.secondary',
                                                mt: 0.5,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {task.description.split('\n')[0]}
                                        </Typography>
                                    </Tooltip>
                                )}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, ml: 1 }}>
                                {task.dueDate && (
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'text.secondary',
                                            textAlign: 'right',
                                            flexShrink: 0,
                                            mt: '1px',
                                        }}
                                    >
                                        {new Date(task.dueDate).toLocaleDateString()}
                                    </Typography>
                                )}
                                <IconButton
                                    size="small"
                                    className="delete-button"
                                    sx={{
                                        visibility: 'hidden',
                                        opacity: 0,
                                        transition: 'visibility 0s, opacity 0.2s linear',
                                        ml: 0.5,
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSubtasks((prev) => prev.filter((id) => id !== task.id));
                                    }}
                                >
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>
                    </Box>
                ))}
            </Box>
        </>
    );
}

export default SubtaskManager;
