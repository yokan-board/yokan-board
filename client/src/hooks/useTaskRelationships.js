import { useMemo, useCallback } from 'react';

export const useTaskRelationships = (taskId, allTasks, subtasks) => {
    const allTasksWithDynamicParentId = useMemo(() => {
        return allTasks.map((taskItem) => {
            // If this task is currently selected as a subtask, its parentId is the current taskId
            if (subtasks.includes(taskItem.id)) {
                return { ...taskItem, parentId: taskId };
            }
            // If this task's original parentId was the current taskId, but it's no longer a selected subtask,
            // then its parentId should be considered null for filtering purposes.
            // This handles the case where a subtask is removed from the UI before saving.
            if (taskItem.parentId === taskId && !subtasks.includes(taskItem.id)) {
                return { ...taskItem, parentId: null };
            }
            return taskItem;
        });
    }, [allTasks, subtasks, taskId]);

    const findAllDescendants = useCallback((currentTaskId, tasks) => {
        const descendants = new Set();
        const queue = [currentTaskId];
        const visited = new Set(); // Track visited tasks to detect cycles

        while (queue.length > 0) {
            const task = queue.shift();
            if (visited.has(task)) continue; // Skip if already visited (cycle detected)
            visited.add(task);

            const children = tasks.filter((t) => t.parentId === task);
            children.forEach((child) => {
                if (!descendants.has(child.id)) {
                    descendants.add(child.id);
                    queue.push(child.id);
                }
            });
        }
        return descendants;
    }, []);

    const findAllAncestors = useCallback((currentTaskId, tasks) => {
        const ancestors = new Set();
        const visited = new Set(); // Track visited tasks to detect cycles
        let task = tasks.find((t) => t.id === currentTaskId);
        while (task && task.parentId) {
            if (visited.has(task.id)) break; // Cycle detected
            visited.add(task.id);

            ancestors.add(task.parentId);
            task = tasks.find((t) => t.id === task.parentId);
        }
        return ancestors;
    }, []);

    const currentTaskDescendants = useMemo(() => {
        return findAllDescendants(taskId, allTasksWithDynamicParentId);
    }, [taskId, allTasksWithDynamicParentId, findAllDescendants]);

    const currentTaskAncestors = useMemo(() => {
        return findAllAncestors(taskId, allTasksWithDynamicParentId);
    }, [taskId, allTasksWithDynamicParentId, findAllAncestors]);

    return {
        allTasksWithDynamicParentId,
        currentTaskDescendants,
        currentTaskAncestors,
    };
};
