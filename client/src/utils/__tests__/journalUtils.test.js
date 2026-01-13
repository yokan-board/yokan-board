import dayjs from 'dayjs';
import { flattenTasks, categorizeTasks } from '../journalUtils';

describe('journalUtils', () => {
    const mockBoards = [
        {
            id: 'board-1',
            name: 'Board One',
            data: {
                columns: {
                    'col-1': {
                        id: 'col-1',
                        title: 'Column One',
                        highlightColor: '#ff0000',
                        tasks: [
                            { id: 'task-1', content: 'Task 1', dueDate: '2026-01-10' }, // Overdue (Today is 2026-01-13)
                            { id: 'task-2', content: 'Task 2', dueDate: '2026-01-13' }, // Today
                        ],
                    },
                },
            },
        },
        {
            id: 'board-2',
            name: 'Board Two',
            data: {
                columns: {
                    'col-2': {
                        id: 'col-2',
                        title: 'Column Two',
                        highlightColor: '#00ff00',
                        tasks: [
                            { id: 'task-3', content: 'Task 3', dueDate: '2026-01-15' }, // Upcoming
                            { id: 'task-4', content: 'Task 4', dueDate: '' }, // No Due Date
                        ],
                    },
                },
            },
        },
    ];

    describe('flattenTasks', () => {
        test('flattens tasks from all boards and adds metadata', () => {
            const flatTasks = flattenTasks(mockBoards);
            expect(flatTasks).toHaveLength(4);
            expect(flatTasks[0]).toMatchObject({
                id: 'task-1',
                boardName: 'Board One',
                columnName: 'Column One',
                highlightColor: '#ff0000',
            });
            expect(flatTasks[2]).toMatchObject({
                id: 'task-3',
                boardName: 'Board Two',
                columnName: 'Column Two',
                highlightColor: '#00ff00',
            });
        });

        test('skips boards without columns', () => {
            const boards = [{ id: 'b1', name: 'Empty', data: {} }];
            expect(flattenTasks(boards)).toHaveLength(0);
        });
    });

    describe('categorizeTasks', () => {
        // Set a fixed date for testing: Tuesday, Jan 13, 2026
        const mockToday = dayjs('2026-01-13').startOf('day');

        test('categorizes tasks correctly', () => {
            const flatTasks = flattenTasks(mockBoards);
            const categories = categorizeTasks(flatTasks, mockToday);

            expect(categories.overdue).toHaveLength(1);
            expect(categories.overdue[0].id).toBe('task-1');

            expect(categories.today).toHaveLength(1);
            expect(categories.today[0].id).toBe('task-2');

            expect(categories.upcoming).toHaveLength(1);
            expect(categories.upcoming[0].date).toBe('2026-01-15');
            expect(categories.upcoming[0].tasks[0].id).toBe('task-3');

            expect(categories.noDueDate).toHaveLength(1);
            expect(categories.noDueDate[0].id).toBe('task-4');
        });
    });
});
