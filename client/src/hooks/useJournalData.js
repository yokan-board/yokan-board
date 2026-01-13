import { useMemo } from 'react';
import { useBoards } from '../contexts/BoardContext';
import { flattenTasks, categorizeTasks } from '../utils/journalUtils';

/**
 * Custom hook to aggregate and categorize all active tasks across all boards.
 * @returns {Object} Grouped tasks and helper state.
 */
export const useJournalData = () => {
    const { boards } = useBoards();

    const journalData = useMemo(() => {
        // 1. Flatten all tasks from all real boards
        const allTasks = flattenTasks(boards);
        
        // 2. Categorize them into priority groups
        return categorizeTasks(allTasks);
    }, [boards]);

    return journalData;
};
