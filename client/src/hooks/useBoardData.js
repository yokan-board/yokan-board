import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { arrayMove } from '@dnd-kit/sortable';
import { createColumnsFromTemplate } from '../services/templateService';
import { useTheme } from '@mui/material/styles';

export const useBoardData = (initialBoardData, boardName, boardId, onSaveBoard) => {
    const theme = useTheme();
    const [boardData, setBoardData] = useState(initialBoardData || { columns: {} });
    const [tasksMap, setTasksMap] = useState({});

    useEffect(() => {
        if (initialBoardData) {
            const columns = initialBoardData.columns || {};
            const updatedColumns = Object.fromEntries(
                Object.entries(columns).map(([id, column]) => [
                    id,
                    {
                        ...column,
                        tasks: Array.isArray(column.tasks) ? column.tasks : [],
                        highlightColor: column.highlightColor || theme.palette.primary.main,
                        minimized: column.minimized || false,
                    },
                ])
            );
            setBoardData({ ...initialBoardData, columns: updatedColumns });
        } else {
            setBoardData({ columns: {} });
        }
    }, [initialBoardData, theme.palette.primary.main]);

    useEffect(() => {
        const newTasksMap = {};
        Object.values(boardData.columns).forEach((column) => {
            if (column.tasks && Array.isArray(column.tasks)) {
                column.tasks.forEach((task) => {
                    newTasksMap[task.id] = { ...task, highlightColor: column.highlightColor };
                });
            }
        });
        setTasksMap(newTasksMap);
    }, [boardData]);

    const findColumn = useCallback(
        (id) => {
            if (id in boardData.columns) {
                return boardData.columns[id];
            }
            const column = Object.values(boardData.columns).find((col) => col.tasks.find((task) => task.id === id));
            return column;
        },
        [boardData.columns]
    );

    const findTask = useCallback(
        (id) => {
            for (const columnId in boardData.columns) {
                const task = boardData.columns[columnId].tasks.find((task) => task.id === id);
                if (task) return task;
            }
            return null;
        },
        [boardData.columns]
    );

    const getParentDisplayId = useCallback(
        (parentId) => {
            const parentTask = findTask(parentId);
            return parentTask ? parentTask.displayId : null;
        },
        [findTask]
    );

    const handleUpdateColumn = useCallback((columnId, updatedColumnData) => {
        setBoardData((prev) => ({
            ...prev,
            columns: {
                ...prev.columns,
                [columnId]: { ...prev.columns[columnId], ...updatedColumnData },
            },
        }));
    }, []);

    const handleAddTask = useCallback((columnId, content) => {
        const newTaskId = uuidv4();
        const displayId = Math.floor(100 + Math.random() * 900).toString();
        const newTask = {
            id: newTaskId,
            displayId: displayId,
            content: content,
            dueDate: null,
            description: '',
            parentId: null,
            subtasks: [],
        };
        setBoardData((prev) => ({
            ...prev,
            columns: {
                ...prev.columns,
                [columnId]: {
                    ...prev.columns[columnId],
                    tasks: [...prev.columns[columnId].tasks, newTask],
                },
            },
        }));
    }, []);

    const handleDeleteTask = useCallback((taskId) => {
        setBoardData((prev) => {
            const newColumns = { ...prev.columns };
            for (const columnId in newColumns) {
                newColumns[columnId].tasks = newColumns[columnId].tasks.filter((task) => task.id !== taskId);
            }
            return { ...prev, columns: newColumns };
        });
    }, []);

    const handleDeleteColumn = useCallback((columnId) => {
        setBoardData((prev) => {
            const newColumns = { ...prev.columns };
            delete newColumns[columnId];
            return { ...prev, columns: newColumns };
        });
    }, []);

    const handleCreateFromTemplate = useCallback((templateName) => {
        const columns = createColumnsFromTemplate(templateName);
        setBoardData((prev) => ({
            ...prev,
            columns: columns,
            columnOrder: Object.keys(columns),
        }));
    }, []);

    const updateBoardDataForColumnReorder = useCallback((activeId, overId) => {
        setBoardData((prev) => {
            const oldIndex = prev.columnOrder.indexOf(activeId);
            const newIndex = prev.columnOrder.indexOf(overId);
            const newColumnOrder = arrayMove(prev.columnOrder, oldIndex, newIndex);
            return {
                ...prev,
                columnOrder: newColumnOrder,
            };
        });
    }, []);

    const updateBoardDataForTaskMove = useCallback(
        (activeId, overId) => {
            setBoardData((prev) => {
                const activeColumn = findColumn(activeId);
                const overColumn = findColumn(overId);

                if (!activeColumn || !overColumn) return prev;

                if (activeColumn.id === overColumn.id) {
                    const newTasks = arrayMove(
                        activeColumn.tasks,
                        activeColumn.tasks.findIndex((task) => task.id === activeId),
                        overColumn.tasks.findIndex((task) => task.id === overId)
                    );
                    return {
                        ...prev,
                        columns: {
                            ...prev.columns,
                            [activeColumn.id]: { ...activeColumn, tasks: newTasks },
                        },
                    };
                } else {
                    const activeTask = activeColumn.tasks.find((task) => task.id === activeId);
                    const newActiveTasks = activeColumn.tasks.filter((task) => task.id !== activeId);
                    const newOverTasks = [...overColumn.tasks];
                    const overIndex = overColumn.tasks.findIndex((task) => task.id === overId);

                    if (overIndex === -1) {
                        newOverTasks.push(activeTask);
                    } else {
                        newOverTasks.splice(overIndex, 0, activeTask);
                    }

                    return {
                        ...prev,
                        columns: {
                            ...prev.columns,
                            [activeColumn.id]: { ...activeColumn, tasks: newActiveTasks },
                            [overColumn.id]: { ...overColumn, tasks: newOverTasks },
                        },
                    };
                }
            });
        },
        [findColumn]
    );

    useEffect(() => {
        const handler = setTimeout(() => {
            onSaveBoard({ name: boardName, data: boardData });
        }, 1000);
        return () => clearTimeout(handler);
    }, [boardData, boardName, onSaveBoard]);

    return {
        boardData,
        tasksMap,
        findColumn,
        findTask,
        getParentDisplayId,
        handleUpdateColumn,
        handleAddTask,
        handleDeleteTask,
        handleDeleteColumn,
        handleCreateFromTemplate,
        updateBoardDataForColumnReorder,
        updateBoardDataForTaskMove,
    };
};
