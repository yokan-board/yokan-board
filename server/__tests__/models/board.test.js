const boardModel = require('../../models/board');
const db = require('../../database');
const { runTransaction } = require('../../utils/dbTransaction');

// Mock the database module
jest.mock('../../database', () => ({
    run: jest.fn(),
    get: jest.fn(),
    all: jest.fn(),
}));

// Mock the runTransaction utility
jest.mock('../../utils/dbTransaction', () => ({
    runTransaction: jest.fn((callback) => callback()), // Simply execute the callback for testing
}));

describe('Board Model', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        db.run.mockReset();
        db.get.mockReset();
        db.all.mockReset();
        runTransaction.mockClear(); // Clear mock for runTransaction
    });

    describe('getAllBoardsByUserId', () => {
        it('should return all boards for a given user ID', async () => {
            const userId = 1;
            const mockBoards = [
                { id: 1, user_id: 1, name: 'Board 1', data: '{ "columns": {} }' },
                { id: 2, user_id: 1, name: 'Board 2', data: '{ "columns": {} }' },
            ];

            db.all.mockImplementationOnce((sql, params, callback) => {
                callback(null, mockBoards);
            });

            const boards = await boardModel.getAllBoardsByUserId(userId);

            expect(db.all).toHaveBeenCalledWith(
                'select * from boards where user_id = ?',
                [userId],
                expect.any(Function)
            );
            expect(boards).toEqual([
                { id: 1, user_id: 1, name: 'Board 1', data: { columns: {} } },
                { id: 2, user_id: 1, name: 'Board 2', data: { columns: {} } },
            ]);
        });

        it('should reject if there is a database error', async () => {
            const userId = 1;
            const dbError = new Error('Database error');

            db.all.mockImplementationOnce((sql, params, callback) => {
                callback(dbError);
            });

            await expect(boardModel.getAllBoardsByUserId(userId)).rejects.toThrow(dbError);
        });
    });

    describe('getBoardById', () => {
        it('should return a board by its ID', async () => {
            const boardId = 1;
            const mockBoard = { id: 1, user_id: 1, name: 'Board 1', data: '{ "columns": {} }' };

            db.get.mockImplementationOnce((sql, params, callback) => {
                callback(null, mockBoard);
            });

            const board = await boardModel.getBoardById(boardId);

            expect(db.get).toHaveBeenCalledWith(
                'select * from boards where id = ?',
                [boardId],
                expect.any(Function)
            );
            expect(board).toEqual({ id: 1, user_id: 1, name: 'Board 1', data: { columns: {} } });
        });

        it('should return undefined if board is not found', async () => {
            const boardId = 99;

            db.get.mockImplementationOnce((sql, params, callback) => {
                callback(null, undefined);
            });

            const board = await boardModel.getBoardById(boardId);

            expect(board).toBeUndefined();
        });

        it('should reject if there is a database error', async () => {
            const boardId = 1;
            const dbError = new Error('Database error');

            db.get.mockImplementationOnce((sql, params, callback) => {
                callback(dbError);
            });

            await expect(boardModel.getBoardById(boardId)).rejects.toThrow(dbError);
        });
    });

    describe('createBoard', () => {
        it('should create a new board and return its ID', async () => {
            const userId = 1;
            const name = 'New Board';
            const data = { columns: { col1: { id: 'col1', title: 'Todo' } } };

            db.run.mockImplementationOnce((sql, params, callback) => {
                callback.call({ lastID: 3 }); // Simulate successful insertion
            });

            const newBoard = await boardModel.createBoard(userId, name, data);

            expect(db.run).toHaveBeenCalledWith(
                'INSERT INTO boards (user_id, name, data) VALUES (?,?,?)',
                [userId, name, JSON.stringify(data)],
                expect.any(Function)
            );
            expect(newBoard).toEqual({ id: 3 });
        });

        it('should reject if there is a database error', async () => {
            const userId = 1;
            const name = 'New Board';
            const data = { columns: {} };
            const dbError = new Error('Database error');

            db.run.mockImplementationOnce((sql, params, callback) => {
                callback(dbError);
            });

            await expect(boardModel.createBoard(userId, name, data)).rejects.toThrow(dbError);
        });
    });

    describe('updateBoard', () => {
        it('should update an existing board and return changes count', async () => {
            const boardId = 1;
            const name = 'Updated Board Name';
            const data = { columns: { col1: { id: 'col1', title: 'Updated Todo' } } };

            db.run.mockImplementationOnce((sql, params, callback) => {
                callback.call({ changes: 1 }); // Simulate successful update
            });

            const updatedBoard = await boardModel.updateBoard(boardId, name, data);

            expect(db.run).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE boards set'),
                [name, JSON.stringify(data), boardId],
                expect.any(Function)
            );
            expect(updatedBoard).toEqual({ id: boardId, changes: 1 });
        });

        it('should reject if there is a database error', async () => {
            const boardId = 1;
            const name = 'Updated Board Name';
            const data = { columns: {} };
            const dbError = new Error('Database error');

            db.run.mockImplementationOnce((sql, params, callback) => {
                callback(dbError);
            });

            await expect(boardModel.updateBoard(boardId, name, data)).rejects.toThrow(dbError);
        });
    });

    describe('deleteBoard', () => {
        it('should delete a board and return changes count', async () => {
            const boardId = 1;

            db.run.mockImplementationOnce((sql, params, callback) => {
                callback.call({ changes: 1 }); // Simulate successful deletion
            });

            const result = await boardModel.deleteBoard(boardId);

            expect(db.run).toHaveBeenCalledWith(
                'DELETE FROM boards WHERE id = ?',
                boardId,
                expect.any(Function)
            );
            expect(result).toEqual({ message: 'deleted', changes: 1 });
        });

        it('should reject if there is a database error', async () => {
            const boardId = 1;
            const dbError = new Error('Database error');

            db.run.mockImplementationOnce((sql, params, callback) => {
                callback(dbError);
            });

            await expect(boardModel.deleteBoard(boardId)).rejects.toThrow(dbError);
        });
    });

    describe('getBoardForExport', () => {
        it('should return board name and data for export', async () => {
            const boardId = 1;
            const userId = 1;
            const mockRow = { name: 'Export Board', data: '{ "columns": {} }' };

            db.get.mockImplementationOnce((sql, params, callback) => {
                callback(null, mockRow);
            });

            const row = await boardModel.getBoardForExport(boardId, userId);

            expect(db.get).toHaveBeenCalledWith(
                'select name, data from boards where id = ? AND user_id = ?',
                [boardId, userId],
                expect.any(Function)
            );
            expect(row).toEqual(mockRow);
        });

        it('should return undefined if board is not found or unauthorized', async () => {
            const boardId = 99;
            const userId = 1;

            db.get.mockImplementationOnce((sql, params, callback) => {
                callback(null, undefined);
            });

            const row = await boardModel.getBoardForExport(boardId, userId);

            expect(row).toBeUndefined();
        });

        it('should reject if there is a database error', async () => {
            const boardId = 1;
            const userId = 1;
            const dbError = new Error('Database error');

            db.get.mockImplementationOnce((sql, params, callback) => {
                callback(dbError);
            });

            await expect(boardModel.getBoardForExport(boardId, userId)).rejects.toThrow(dbError);
        });
    });

    describe('importBoard', () => {
        it('should import a new board and return its details', async () => {
            const userId = 1;
            const name = 'Imported Board';
            const data = { columns: { col1: { id: 'col1', title: 'Imported Todo' } } };

            db.run.mockImplementationOnce((sql, params, callback) => {
                callback.call({ lastID: 4 }); // Simulate successful insertion
            });

            const newBoard = await boardModel.importBoard(userId, name, data);

            expect(runTransaction).toHaveBeenCalledTimes(1);
            expect(db.run).toHaveBeenCalledWith(
                'INSERT INTO boards (user_id, name, data) VALUES (?,?,?)',
                [userId, name, JSON.stringify(data)],
                expect.any(Function)
            );
            expect(newBoard).toEqual({ id: 4, name, data });
        });

        it('should reject if there is a database error during import', async () => {
            const userId = 1;
            const name = 'Imported Board';
            const data = { columns: {} };
            const dbError = new Error('Database error');

            db.run.mockImplementationOnce((sql, params, callback) => {
                callback(dbError);
            });

            await expect(boardModel.importBoard(userId, name, data)).rejects.toThrow(dbError);
        });
    });
});
