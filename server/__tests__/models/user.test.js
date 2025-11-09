const userModel = require('../../models/user');
const db = require('../../database');
const bcrypt = require('bcrypt');

// Mock the database module
jest.mock('../../database', () => ({
    run: jest.fn(),
    get: jest.fn(),
    all: jest.fn(),
}));

describe('User Model', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        db.run.mockReset();
        db.get.mockReset();
        db.all.mockReset();
    });

    describe('createUser', () => {
        it('should create a new user and return their ID, username, and email', async () => {
            const username = 'testuser';
            const password = 'password123';
            const email = 'test@example.com';
            const hashedPassword = bcrypt.hashSync(password, 10);

            db.run.mockImplementationOnce((sql, params, callback) => {
                callback.call({ lastID: 1 }); // Simulate successful insertion with lastID
            });

            const newUser = await userModel.createUser(username, hashedPassword, email);

            expect(db.run).toHaveBeenCalledWith(
                'INSERT INTO users (username, password, email) VALUES (?,?,?)',
                [username, hashedPassword, email],
                expect.any(Function)
            );
            expect(newUser).toEqual({ id: 1, username, email });
        });

        it('should reject if there is a database error', async () => {
            const username = 'testuser';
            const password = 'password123';
            const email = 'test@example.com';
            const hashedPassword = bcrypt.hashSync(password, 10);
            const dbError = new Error('Database error');

            db.run.mockImplementationOnce((sql, params, callback) => {
                callback(dbError); // Simulate a database error
            });

            await expect(userModel.createUser(username, hashedPassword, email)).rejects.toThrow(
                dbError
            );
        });
    });

    describe('findUserByUsername', () => {
        it('should find a user by username', async () => {
            const username = 'testuser';
            const mockUser = {
                id: 1,
                username,
                password: 'hashedpassword',
                email: 'test@example.com',
            };

            db.get.mockImplementationOnce((sql, params, callback) => {
                callback(null, mockUser); // Simulate finding a user
            });

            const foundUser = await userModel.findUserByUsername(username);

            expect(db.get).toHaveBeenCalledWith(
                'select * from users where username = ?',
                [username],
                expect.any(Function)
            );
            expect(foundUser).toEqual(mockUser);
        });

        it('should return undefined if user is not found', async () => {
            const username = 'nonexistentuser';

            db.get.mockImplementationOnce((sql, params, callback) => {
                callback(null, undefined); // Simulate user not found
            });

            const foundUser = await userModel.findUserByUsername(username);

            expect(db.get).toHaveBeenCalledWith(
                'select * from users where username = ?',
                [username],
                expect.any(Function)
            );
            expect(foundUser).toBeUndefined();
        });

        it('should reject if there is a database error', async () => {
            const username = 'testuser';
            const dbError = new Error('Database error');

            db.get.mockImplementationOnce((sql, params, callback) => {
                callback(dbError); // Simulate a database error
            });

            await expect(userModel.findUserByUsername(username)).rejects.toThrow(dbError);
        });
    });

    describe('updateUser', () => {
        it('should update a user and return the number of changes', async () => {
            const userId = 1;
            const userData = { display_name: 'New Name', email: 'new@example.com' };

            db.run.mockImplementationOnce((sql, params, callback) => {
                callback.call({ changes: 1 }); // Simulate one row changed
            });

            const changes = await userModel.updateUser(userId, userData);

            expect(db.run).toHaveBeenCalledWith(
                'UPDATE users SET display_name = ?, email = ? WHERE id = ?',
                ['New Name', 'new@example.com', userId],
                expect.any(Function)
            );
            expect(changes).toBe(1);
        });

        it('should resolve with 0 changes if userData is empty', async () => {
            const changes = await userModel.updateUser(1, {});
            expect(changes).toBe(0);
            expect(db.run).not.toHaveBeenCalled();
        });
    });

    describe('findUserByEmail', () => {
        it('should find a user by email', async () => {
            const email = 'test@example.com';
            const mockUser = { id: 1, username: 'testuser', email };

            db.get.mockImplementationOnce((sql, params, callback) => {
                callback(null, mockUser);
            });

            const foundUser = await userModel.findUserByEmail(email);

            expect(db.get).toHaveBeenCalledWith(
                'SELECT * FROM users WHERE email = ?',
                [email],
                expect.any(Function)
            );
            expect(foundUser).toEqual(mockUser);
        });
    });
});
