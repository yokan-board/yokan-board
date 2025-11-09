import api from './api'; // Import the shared api instance

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

const boardService = {
    getBoards,
    getBoard,
    createBoard,
    updateBoard,
    deleteBoard,
    exportBoardJson,
    exportBoardCsv,
    importBoardJson,
    importBoardCsv,
};

export default boardService;
