import dayjs from 'dayjs';

/**
 * Flattens all non-archived tasks from all boards and columns.
 * Adds source metadata to each task.
 * @param {Array} boards - Array of board objects.
 * @returns {Array} Flat array of task objects with metadata.
 */
export const flattenTasks = (boards) => {
    const allTasks = [];

    boards.forEach((board) => {
        // Skip virtual boards or boards without data/columns
        if (!board.data || !board.data.columns) return;

        Object.values(board.data.columns).forEach((column) => {
            if (!column.tasks) return;

            column.tasks.forEach((task) => {
                allTasks.push({
                    ...task,
                    boardId: board.id,
                    boardName: board.name,
                    columnId: column.id,
                    columnName: column.title,
                    highlightColor: column.highlightColor,
                });
            });
        });
    });

    return allTasks;
};

/**
 * Categorizes tasks into Overdue, Today, Upcoming, and No Due Date.
 * @param {Array} tasks - Flat array of tasks.
 * @param {Object} [todayOverride] - Optional dayjs object for "today".
 * @returns {Object} Categorized tasks.
 */
export const categorizeTasks = (tasks, todayOverride = null) => {
    const today = todayOverride || dayjs().startOf('day');
    
    const categories = {
        overdue: [],
        today: [],
        upcoming: {}, // Keyed by date string for further grouping
        noDueDate: [],
    };

    tasks.forEach((task) => {
        if (!task.dueDate) {
            categories.noDueDate.push(task);
            return;
        }

        const dueDate = dayjs(task.dueDate).startOf('day');

        if (dueDate.isBefore(today)) {
            categories.overdue.push(task);
        } else if (dueDate.isSame(today)) {
            categories.today.push(task);
        } else {
            const dateStr = dueDate.format('YYYY-MM-DD');
            if (!categories.upcoming[dateStr]) {
                categories.upcoming[dateStr] = [];
            }
            categories.upcoming[dateStr].push(task);
        }
    });

    // Sort upcoming dates
    const sortedUpcomingKeys = Object.keys(categories.upcoming).sort();
    const sortedUpcoming = sortedUpcomingKeys.map((date) => ({
        date,
        tasks: categories.upcoming[date],
    }));

    return {
        ...categories,
        upcoming: sortedUpcoming,
    };
};
