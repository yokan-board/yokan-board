process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testjwtsecret';

const { app, startServer } = require('../index');
const request = require('supertest')(app);
const db = require('../database');
const bcrypt = require('bcrypt');

describe('User Account Management API', () => {
    let serverInstance;
    let authToken;
    let userId;

    beforeAll((done) => {
        serverInstance = startServer(0); // Start on a random port
        db.serialize(async () => {
            db.run('DELETE FROM users');
            const hashedPassword = bcrypt.hashSync('password123', 10);
            db.run(
                'INSERT INTO users (username, password, email, display_name) VALUES (?,?,?,?)',
                ['testuser', hashedPassword, 'test@example.com', 'Test User'],
                function (err) {
                    if (err) return done(err);
                    userId = this.lastID;
                    // Log in to get a JWT
                    request
                        .post('/api/v1.1/login')
                        .send({ username: 'testuser', password: 'password123' })
                        .end((err, res) => {
                            if (err) return done(err);
                            authToken = res.body.token;
                            done();
                        });
                }
            );
        });
    });

    afterAll((done) => {
        serverInstance.close(done);
    });

    it('should get the user profile', async () => {
        const res = await request
            .get('/api/v1.1/user/profile')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('id', userId);
        expect(res.body).toHaveProperty('username', 'testuser');
        expect(res.body).toHaveProperty('display_name', 'Test User');
        expect(res.body).toHaveProperty('email', 'test@example.com');
    });

    it('should update the user profile', async () => {
        const res = await request
            .put('/api/v1.1/user/profile')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ display_name: 'Updated Name', email: 'updated@example.com' });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('display_name', 'Updated Name');
        expect(res.body).toHaveProperty('email', 'updated@example.com');
    });

    it('should update the password', async () => {
        const res = await request
            .put('/api/v1.1/user/password')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ currentPassword: 'password123', newPassword: 'newpassword456' });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Password updated successfully.');

        // Verify the new password works
        const loginRes = await request
            .post('/api/v1.1/login')
            .send({ username: 'testuser', password: 'newpassword456' });
        expect(loginRes.statusCode).toEqual(200);
    });

    it('should get user preferences', async () => {
        const res = await request
            .get('/api/v1.1/user/preferences')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({}); // Default preferences
    });

    it('should update user preferences', async () => {
        const res = await request
            .put('/api/v1.1/user/preferences')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ theme: 'dark' });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('theme', 'dark');

        // Verify the preferences were saved
        const getRes = await request
            .get('/api/v1.1/user/preferences')
            .set('Authorization', `Bearer ${authToken}`);
        expect(getRes.body).toHaveProperty('theme', 'dark');
    });
});
