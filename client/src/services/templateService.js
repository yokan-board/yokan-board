import { v4 as uuidv4 } from 'uuid';
import { getRandomColor } from './colorService';

export const columnTemplates = {
    '1 Column': ['To Do'],
    'Standard 3 columns': ['To Do', 'In Progress', 'Done'],
    'Standard 4 columns': ['To Do', 'In Progress', 'Done', 'On Hold'],
    'Standard 5 columns': ['To Do', 'Selected', 'In Progress', 'Testing', 'Done'],
};

export const createColumnsFromTemplate = (templateName) => {
    let columns = {};
    if (columnTemplates[templateName]) {
        const columnNames = columnTemplates[templateName];
        const standard3Colors = ['#AF522B', '#23863D', '#3247D8'];
        const standard4Colors = ['#AF522B', '#23863D', '#3247D8', '#9C0029'];

        columnNames.forEach((name, index) => {
            const id = uuidv4();
            let highlightColor = getRandomColor(); // Default to random

            if (templateName === 'Standard 3 columns' && standard3Colors[index]) {
                highlightColor = standard3Colors[index];
            } else if (templateName === 'Standard 4 columns' && standard4Colors[index]) {
                highlightColor = standard4Colors[index];
            }

            columns[id] = { id, title: name, tasks: [], highlightColor };
        });
    }
    return columns;
};
