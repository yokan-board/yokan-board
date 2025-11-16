import dayjs from 'dayjs';

/**
 * Adds a task to the archive history for a given date.
 * If an entry for the date already exists, the task is appended.
 * Otherwise, a new date entry is created.
 * The archive history is maintained in chronological order (newest date first).
 *
 * @param {Array<object>} archiveHistory - The current archive history array.
 * @param {object} task - The task object to archive.
 * @param {string} date - The archival date in 'YYYY-MM-DD' format.
 * @returns {Array<object>} The updated archive history array.
 */
export const addTaskToArchive = (archiveHistory, task, date) => {
    const newArchiveHistory = [...archiveHistory];
    const dateIndex = newArchiveHistory.findIndex((entry) => entry.date === date);

    if (dateIndex !== -1) {
        // Date entry exists, add task to it immutably
        newArchiveHistory[dateIndex] = {
            ...newArchiveHistory[dateIndex],
            tasks: [...newArchiveHistory[dateIndex].tasks, task],
        };
    } else {
        // Date entry does not exist, create a new one
        newArchiveHistory.push({ date, tasks: [task] });
        // Sort by date in descending order (newest first)
        newArchiveHistory.sort((a, b) => dayjs(b.date).diff(dayjs(a.date)));
    }
    return newArchiveHistory;
};

/**
 * Removes a task from its current column within the board's columns object.
 *
 * @param {object} columns - The columns object from board.data.
 * @param {string} taskId - The ID of the task to remove.
 * @returns {object} The updated columns object.
 */
export const removeTaskFromColumns = (columns, taskId) => {
    const newColumns = { ...columns };
    for (const columnId in newColumns) {
        newColumns[columnId] = {
            ...newColumns[columnId],
            tasks: newColumns[columnId].tasks.filter((task) => task.id !== taskId),
        };
    }
    return newColumns;
};

/**
 * Extracts all tasks from a specified column, adds them to archiveHistory,
 * and removes them from the column.
 *
 * @param {object} columns - The columns object from board.data.
 * @param {Array<object>} archiveHistory - The current archive history array.
 * @param {string} columnId - The ID of the column to archive tasks from.
 * @param {string} date - The archival date in 'YYYY-MM-DD' format.
 * @returns {{updatedColumns: object, updatedArchiveHistory: Array<object>}} An object containing the updated columns and archive history.
 */
export const archiveColumnTasks = (columns, archiveHistory, columnId, date) => {
    const newColumns = { ...columns };
    const newArchiveHistory = [...archiveHistory];

    if (newColumns[columnId]) {
        const tasksToArchive = newColumns[columnId].tasks;
        const columnHighlightColor = newColumns[columnId].highlightColor; // Get column's highlight color
        const columnTitle = newColumns[columnId].title; // Get column's title
        tasksToArchive.forEach((task) => {
            const updatedTask = {
                ...task,
                archivedAt: date,
                highlightColor: columnHighlightColor,
                columnTitle: columnTitle,
            }; // Add archivedAt timestamp, highlightColor, and columnTitle
            const dateIndex = newArchiveHistory.findIndex((entry) => entry.date === date);
            if (dateIndex !== -1) {
                newArchiveHistory[dateIndex] = {
                    ...newArchiveHistory[dateIndex],
                    tasks: [...newArchiveHistory[dateIndex].tasks, updatedTask],
                };
            } else {
                newArchiveHistory.push({ date, tasks: [updatedTask] });
            }
        });
        // Sort by date in descending order (newest first)
        newArchiveHistory.sort((a, b) => dayjs(b.date).diff(dayjs(a.date)));

        newColumns[columnId] = {
            ...newColumns[columnId],
            tasks: [], // Remove all tasks from the column
        };
    }

    return { updatedColumns: newColumns, updatedArchiveHistory: newArchiveHistory };
};

/**
 * Finds a parent task across all columns and updates its description with a log of an archived subtask.
 *
 * @param {object} columns - The columns object from board.data.
 * @param {object} archivedTask - The subtask that was archived.
 * @param {string} archiveDate - The date of the archival.
 * @returns {object} The updated columns object. If no parent is found, returns the original columns object.
 */
export const updateParentWithArchivedLog = (columns, archivedTask, archiveDate) => {
    if (!archivedTask.parentId) {
        return columns;
    }

    let parentTask = null;
    let parentColumnId = null;

    // Find the parent task and its column
    for (const colId in columns) {
        const foundTask = columns[colId].tasks.find((task) => task.id === archivedTask.parentId);
        if (foundTask) {
            parentTask = foundTask;
            parentColumnId = colId;
            break;
        }
    }

    if (!parentTask) {
        return columns;
    }

    // Generate the markdown log
    const logHeader = '\n\n## Archived Subtasks\n';
    const descriptionBlock = (archivedTask.description || '')
        .split('\n')
        .map((line) => `        > ${line || ''}`)
        .join('\n');

    const logEntry = `- #${archivedTask.displayId} **${archivedTask.content}**\n    - Due: ${
        archivedTask.dueDate || 'N/A'
    }\n    - Archived: ${archiveDate}\n    - Description:\n${descriptionBlock || '        > N/A'}\n`;

    const newDescription = (parentTask.description || '').includes(logHeader)
        ? (parentTask.description || '') + logEntry
        : (parentTask.description || '') + logHeader + logEntry;

    const updatedParentTask = {
        ...parentTask,
        description: newDescription,
    };

    const updatedTasks = columns[parentColumnId].tasks.map((task) =>
        task.id === updatedParentTask.id ? updatedParentTask : task
    );

    const updatedColumn = {
        ...columns[parentColumnId],
        tasks: updatedTasks,
    };

    return {
        ...columns,
        [parentColumnId]: updatedColumn,
    };
};

/**
 * Finds multiple parent tasks and updates their descriptions with logs of their archived subtasks.
 *
 * @param {object} columns - The columns object from board.data.
 * @param {Array<object>} archivedTasks - An array of subtasks that were archived.
 * @param {string} archiveDate - The date of the archival.
 * @returns {object} The updated columns object.
 */
export const updateParentsWithArchivedLogs = (columns, archivedTasks, archiveDate) => {
    const subtasksWithParents = archivedTasks.filter((task) => task.parentId);

    if (subtasksWithParents.length === 0) {
        return columns;
    }

    // Group subtasks by parentId
    const parentIdToSubtasks = subtasksWithParents.reduce((acc, task) => {
        if (!acc[task.parentId]) {
            acc[task.parentId] = [];
        }
        acc[task.parentId].push(task);
        return acc;
    }, {});

    let newColumns = { ...columns };

    // Find all parent tasks first
    const parentTasks = {}; // { taskId: taskObject }
    const parentIdToColumnId = {};
    for (const colId in newColumns) {
        for (const task of newColumns[colId].tasks) {
            if (parentIdToSubtasks[task.id]) {
                parentTasks[task.id] = task;
                parentIdToColumnId[task.id] = colId;
            }
        }
    }

    // Generate new descriptions for each parent
    const parentIdToNewDescription = {};
    for (const parentId in parentIdToSubtasks) {
        const parentTask = parentTasks[parentId];
        if (parentTask) {
            const logHeader = '\n\n## Archived Subtasks\n';
            let newDescription = parentTask.description || '';
            if (!newDescription.includes(logHeader)) {
                newDescription += logHeader;
            }
            const subtasks = parentIdToSubtasks[parentId];
            for (const subtask of subtasks) {
                const descriptionBlock = (subtask.description || '')
                    .split('\n')
                    .map((line) => `        > ${line || ''}`)
                    .join('\n');

                const logEntry = `- #${subtask.displayId} **${subtask.content}**\n    - Due: ${
                    subtask.dueDate || 'N/A'
                }\n    - Archived: ${archiveDate}\n    - Description:\n${descriptionBlock || '        > N/A'}\n`;
                newDescription += logEntry;
            }
            parentIdToNewDescription[parentId] = newDescription;
        }
    }

    // Apply updates immutably
    const updatedColumnIds = new Set(Object.values(parentIdToColumnId));
    updatedColumnIds.forEach((colId) => {
        const originalColumn = newColumns[colId];
        const newTasks = originalColumn.tasks.map((task) => {
            if (parentIdToNewDescription[task.id]) {
                return { ...task, description: parentIdToNewDescription[task.id] };
            }
            return task;
        });
        newColumns[colId] = { ...originalColumn, tasks: newTasks };
    });

    return newColumns;
};
