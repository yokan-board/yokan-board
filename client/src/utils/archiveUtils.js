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
