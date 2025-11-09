process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testjwtsecret'; // Set a test secret for JWT

const { app, startServer } = require('../index');
const request = require('supertest')(app);
const db = require('../database');
const bcrypt = require('bcrypt');
const jwt /* eslint-disable-line no-unused-vars */ = require('jsonwebtoken'); // Import jsonwebtoken

describe('Kanban Board API', () => {
    let userId;
    let authToken; // To store the JWT
    let serverInstance;

    beforeAll((done) => {
        serverInstance = startServer(0); // Start on a random port
        db.serialize(async () => {
            // Use async here
            db.run('DELETE FROM users');
            db.run('DELETE FROM boards');
            const hashedPassword = bcrypt.hashSync('testpassword', 10);
            const insert = 'INSERT INTO users (username, password, email) VALUES (?,?,?)'; // Added email
            db.run(insert, ['testuser', hashedPassword, 'test@example.com'], async function (err) {
                // Added email
                if (err) {
                    console.error('Error creating test user:', err.message);
                    return done(err);
                }
                userId = this.lastID;

                // Log in to get a JWT
                const res = await request.post('/api/login').send({
                    username: 'testuser',
                    password: 'testpassword',
                });
                authToken = res.body.token; // Store the JWT

                done();
            });
        });
    });

    afterAll((done) => {
        serverInstance.close(() => {
            db.close(() => {
                done();
            });
        });
    });

    it('should log in an existing user and return a JWT', async () => {
        const res = await request.post('/api/login').send({
            username: 'testuser',
            password: 'testpassword',
        });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'success');
        expect(res.body.data).toHaveProperty('id', userId);
        expect(res.body).toHaveProperty('token'); // Check for token
    });

    it('should not log in with incorrect password', async () => {
        const res = await request.post('/api/login').send({
            username: 'testuser',
            password: 'wrongpassword',
        });
        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('message', 'Incorrect password'); // Updated from 'error' to 'message' due to error handler
    });

    it('should create a new board for the user', async () => {
        const res = await request
            .post('/api/boards')
            .set('Authorization', `Bearer ${authToken}`) // Use JWT
            .send({
                user_id: userId,
                name: 'My First Board',
                data: { columns: [] }, // Send as object, not string
            });
        expect(res.statusCode).toEqual(201); // Updated to 201 for creation
        expect(res.body).toHaveProperty('message', 'success');
        expect(res.body.data).toHaveProperty('id');
    });

    it('should get all boards for a user', async () => {
        const res = await request
            .get(`/api/users/${userId}/boards`)
            .set('Authorization', `Bearer ${authToken}`); // Use JWT
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'success');
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should update a board', async () => {
        // First, create a board to update
        const createRes = await request
            .post('/api/boards')
            .set('Authorization', `Bearer ${authToken}`) // Use JWT
            .send({
                user_id: userId,
                name: 'Board to Update',
                data: { columns: [] },
            });
        expect(createRes.statusCode).toEqual(201);
        const boardId = createRes.body.data.id;

        const updatedName = 'Updated Board Name';
        const updatedData = { columns: [{ id: '1', title: 'Todo' }] };

        const res = await request
            .put(`/api/boards/${boardId}`)
            .set('Authorization', `Bearer ${authToken}`) // Use JWT
            .send({
                name: updatedName,
                data: updatedData,
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'success');
        expect(res.body.data).toHaveProperty('id', Number(boardId));

        // Verify the update
        const getRes = await request
            .get(`/api/boards/${boardId}`)
            .set('Authorization', `Bearer ${authToken}`); // Use JWT
        expect(getRes.statusCode).toEqual(200);
        expect(getRes.body.data.name).toEqual(updatedName);
        expect(getRes.body.data.data).toEqual(updatedData);
    });

    it('should delete a board', async () => {
        // First, create a board to delete
        const createRes = await request
            .post('/api/boards')
            .set('Authorization', `Bearer ${authToken}`) // Use JWT
            .send({
                user_id: userId,
                name: 'Board to Delete',
                data: { columns: [] },
            });
        expect(createRes.statusCode).toEqual(201);
        const boardId = createRes.body.data.id;

        const res = await request
            .delete(`/api/boards/${boardId}`)
            .set('Authorization', `Bearer ${authToken}`); // Use JWT
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'deleted');
        expect(res.body).toHaveProperty('changes', 1);

        // Verify deletion
        const getRes = await request
            .get(`/api/boards/${boardId}`)
            .set('Authorization', `Bearer ${authToken}`); // Use JWT
        expect(getRes.statusCode).toEqual(404); // Expect 404 after deletion
        expect(getRes.body).toHaveProperty('message', 'Board not found'); // Updated message
    });

    it('should export a board to JSON', async () => {
        // Create a board to export
        const createRes = await request
            .post('/api/boards')
            .set('Authorization', `Bearer ${authToken}`) // Use JWT
            .send({
                user_id: userId,
                name: 'Export JSON Board',
                data: {
                    columns: {
                        col1: {
                            id: 'col1',
                            title: 'Todo',
                            tasks: [{ id: 'task1', content: 'Task 1' }],
                        },
                    },
                },
            });
        expect(createRes.statusCode).toEqual(201);
        const boardId = createRes.body.data.id;

        const res = await request
            .get(`/api/boards/${boardId}/export/json`)
            .set('Authorization', `Bearer ${authToken}`); // Use JWT

        expect(res.statusCode).toEqual(200);
        expect(res.headers['content-type']).toContain('application/json');
        expect(res.headers['content-disposition']).toContain('attachment');
        expect(res.body).toHaveProperty('name', 'Export JSON Board');
        expect(res.body).toHaveProperty('data');
        const firstColumnId = Object.keys(res.body.data.columns)[0];
        expect(res.body.data.columns[firstColumnId].tasks[0].content).toEqual('Task 1');
    });

    it('should export a board to CSV', async () => {
        // Create a board to export
        const createRes = await request
            .post('/api/boards')
            .set('Authorization', `Bearer ${authToken}`) // Use JWT
            .send({
                user_id: userId,
                name: 'Export CSV Board',
                data: {
                    columns: {
                        col1: {
                            id: 'col1',
                            title: 'Todo',
                            tasks: [
                                {
                                    id: 'task1',
                                    content: 'Task 1',
                                    description: 'Desc 1',
                                    dueDate: '2023-01-01',
                                },
                            ],
                        },
                    },
                },
            });
        expect(createRes.statusCode).toEqual(201);
        const boardId = createRes.body.data.id;

        const res = await request
            .get(`/api/boards/${boardId}/export/csv`)
            .set('Authorization', `Bearer ${authToken}`); // Use JWT

        expect(res.statusCode).toEqual(200);
        expect(res.headers['content-type']).toContain('text/csv');
        expect(res.headers['content-disposition']).toContain('attachment');
        const expectedCsv = `Task ID,Task Content,Description,Due Date,Column Name,Parent Task ID\n"task1","Task 1","Desc 1","2023-01-01","Todo",""`;
        expect(res.text).toEqual(expectedCsv);
    });

    it('should import a board from JSON', async () => {
        const importData = {
            name: 'Imported Board',
            data: {
                columns: [
                    {
                        id: 'imp_col1',
                        title: 'Imported Todo',
                        tasks: [{ id: 'imp_task1', content: 'Imported Task 1' }],
                    },
                ],
            },
        };

        const res = await request
            .post('/api/boards/import/json')
            .set('Authorization', `Bearer ${authToken}`) // Use JWT
            .send(importData);

        expect(res.statusCode).toEqual(201); // Updated to 201 for creation
        expect(res.body).toHaveProperty('message', 'success');
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data.name).toEqual('Imported Board');
        expect(res.body.data.data.columns[0].tasks[0].content).toEqual('Imported Task 1');

        // Verify the board was actually created in the DB
        const getRes = await request
            .get(`/api/boards/${res.body.data.id}`)
            .set('Authorization', `Bearer ${authToken}`); // Use JWT
        expect(getRes.statusCode).toEqual(200);
        expect(getRes.body.data.name).toEqual('Imported Board');
    });
});
