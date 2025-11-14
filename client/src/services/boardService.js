import api from './api'; // Import the shared api instance
import JSZip from 'jszip'; // Import jszip for ZIP file generation

const parseBoardData = (board) => {
    if (board && typeof board.data === 'string') {
        try {
            board.data = JSON.parse(board.data);
        } catch (e) {
            console.error('Error parsing board data JSON:', e);
            board.data = { columns: {} }; // Default to empty if parsing fails
        }
    }
    // Ensure columns is an object, even if it's an empty array from old data
    if (board && board.data && Array.isArray(board.data.columns)) {
        board.data.columns = {};
    }
    return board;
};

const getBoards = async (userId) => {
    const response = await api.get(`/users/${userId}/boards`); // x-user-id removed
    return response.data.data.map(parseBoardData);
};

const getBoard = async (boardId, noCache = false) => {
    const config = {};
    if (noCache) {
        config.params = { _: new Date().getTime() };
    }
    const response = await api.get(`/boards/${boardId}`, config);
    return parseBoardData(response.data.data);
};

const createBoard = async (userId, name, data) => {
    const response = await api.post(`/boards`, { user_id: userId, name, data: data });
    return response.data.data;
};

const updateBoard = async (boardId, name, data) => {
    const response = await api.put(`/boards/${boardId}`, { name, data: data });
    return response.data.data;
};

const deleteBoard = async (boardId) => {
    const response = await api.delete(`/boards/${boardId}`);
    return response.data;
};

const exportBoardJson = async (boardId, userId) => {
    const response = await api.get(`/boards/${boardId}/export/json`, {
        responseType: 'blob', // Important for file downloads
        // headers: { 'x-user-id': userId }, // x-user-id removed
    });
    // Create a Blob from the response data
    const blob = new Blob([response.data], { type: 'application/json' });
    // Create a link element, set its href to the Blob, and click it to trigger download
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = response.headers['content-disposition'].split('filename=')[1].replace(/"/g, ''); // Extract filename from headers
    link.click();
    window.URL.revokeObjectURL(link.href); // Clean up the URL object
    return response.data;
};

const exportBoardCsv = async (boardId, userId) => {
    const response = await api.get(`/boards/${boardId}/export/csv`, {
        responseType: 'blob', // Important for file downloads
        // headers: { 'x-user-id': userId }, // x-user-id removed
    });
    const blob = new Blob([response.data], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = response.headers['content-disposition'].split('filename=')[1].replace(/"/g, '');
    link.click();
    window.URL.revokeObjectURL(link.href);
    return response.data;
};

const exportBoardMarkdown = (boardName, boardDescription, boardData) => {
    let markdown = `# Board Name: ${boardName}\n\n`;
    if (boardDescription) {
        markdown += `${boardDescription}\n\n`;
    }

    const tasksMap = {};
    if (boardData.columns) {
        Object.values(boardData.columns).forEach((col) => {
            if (col.tasks) {
                col.tasks.forEach((t) => (tasksMap[t.id] = t));
            }
        });
    }

    if (boardData.columnOrder) {
        boardData.columnOrder.forEach((columnId) => {
            const column = boardData.columns[columnId];
            if (!column) return;
            markdown += `## Column: ${column.title}\n\n`;

            if (column.tasks && Array.isArray(column.tasks)) {
                column.tasks.forEach((task) => {
                    if (!task) return;

                    const isCompleted = task.completed ? 'x' : ' ';
                    markdown += `- [${isCompleted}] **${task.content}** (#${task.displayId})\n`;

                    if (task.dueDate) {
                        const date = new Date(task.dueDate).toISOString().split('T')[0];
                        markdown += `  - **Due:** ${date}\n`;
                    }

                    if (task.description) {
                        const description = task.description.replace(/\n/g, '\n    > ');
                        markdown += `  - **Description:**\n    > ${description}\n`;
                    }

                    if (task.subtasks && task.subtasks.length > 0) {
                        markdown += `  - **Subtasks:**\n`;
                        task.subtasks.forEach((subtaskId) => {
                            const subtask = tasksMap[subtaskId];
                            if (subtask) {
                                const isSubtaskCompleted = subtask.completed ? 'x' : ' ';
                                markdown += `    - [${isSubtaskCompleted}] ${subtask.content} (#${subtask.displayId})\n`;
                            }
                        });
                    }
                    markdown += '\n';
                });
            }
        });
    }

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    const date = new Date().toISOString().split('T')[0];
    link.download = `${boardName}-export-${date}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
};

const importBoardJson = async (boardData, userId) => {
    const response = await api.post(`/boards/import/json`, boardData, {
        // headers: { 'x-user-id': userId }, // x-user-id removed
    });
    return response.data;
};

const importBoardCsv = async (csvData, boardName) => {
    const response = await api.post(`/boards/import/csv`, { csvData, boardName });
    return response.data;
};

const exportAllBoardsMarkdownAsZip = async (userId) => {
    try {
        const allBoards = await getBoards(userId);
        const zip = new JSZip();
        const date = new Date().toISOString().split('T')[0];

        for (const board of allBoards) {
            let markdown = `# Board Name: ${board.name}\n\n`;
            if (board.data.description) {
                markdown += `${board.data.description}\n\n`;
            }

            const tasksMap = {};
            if (board.data.columns) {
                Object.values(board.data.columns).forEach((col) => {
                    if (col.tasks) {
                        col.tasks.forEach((t) => (tasksMap[t.id] = t));
                    }
                });
            }

            if (board.data.columnOrder) {
                board.data.columnOrder.forEach((columnId) => {
                    const column = board.data.columns[columnId];
                    if (!column) return;
                    markdown += `## Column: ${column.title}\n\n`;

                    if (column.tasks && Array.isArray(column.tasks)) {
                        column.tasks.forEach((task) => {
                            if (!task) return;

                            const isCompleted = task.completed ? 'x' : ' ';
                            markdown += `- [${isCompleted}] **${task.content}** (#${task.displayId})\n`;

                            if (task.dueDate) {
                                const dueDate = new Date(task.dueDate).toISOString().split('T')[0];
                                markdown += `  - **Due:** ${dueDate}\n`;
                            }

                            if (task.description) {
                                const description = task.description.replace(/\n/g, '\n    > ');
                                markdown += `  - **Description:**\n    > ${description}\n`;
                            }

                            if (task.subtasks && task.subtasks.length > 0) {
                                markdown += `  - **Subtasks:**\n`;
                                task.subtasks.forEach((subtaskId) => {
                                    const subtask = tasksMap[subtaskId];
                                    if (subtask) {
                                        const isSubtaskCompleted = subtask.completed ? 'x' : ' ';
                                        markdown += `    - [${isSubtaskCompleted}] ${subtask.content} (#${subtask.displayId})\n`;
                                    }
                                });
                            }
                            markdown += '\n';
                        });
                    }
                });
            }
            zip.file(`${board.name}-export-${date}.md`, markdown);
        }

        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(content);
        link.download = `all-boards-markdown-export-${date}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error('Error exporting all boards as Markdown ZIP:', error);
        throw error;
    }
};

const boardService = {
    getBoards,
    getBoard,
    createBoard,
    updateBoard,
    deleteBoard,
    exportBoardJson,
    exportBoardCsv,
    exportBoardMarkdown,
    importBoardJson,
    importBoardCsv,
    exportAllBoardsMarkdownAsZip,
};

export default boardService;
