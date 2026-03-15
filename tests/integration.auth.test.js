const request = require('supertest');
const { app } = require('../app');
const { initTestDb, cleanupTestDb } = require('./testUtils');

function uniqueUser(prefix) {
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

beforeAll(async () => {
    await initTestDb();
});

afterAll(async () => {
    await cleanupTestDb();
});

describe('Auth integration', () => {
    test('signup and login success', async () => {
        const username = uniqueUser('user');
        const password = 'pass123';

        const signupRes = await request(app)
            .post('/auth/signup')
            .send({ username, password });
        // Expect successful user creation
        expect(signupRes.status).toBe(201);

        const loginRes = await request(app)
            .post('/auth/login')
            .send({ username, password });
        // Expect successful login
        expect(loginRes.status).toBe(200);
        // Expect a token to be returned
        expect(loginRes.body.token).toBeTruthy();
    });

    test('signup duplicate username returns 409', async () => {
        const username = uniqueUser('dupe');
        const password = 'pass123';

        await request(app)
            .post('/auth/signup')
            .send({ username, password });

        const signupRes = await request(app)
            .post('/auth/signup')
            .send({ username, password });
        // Expect conflict on duplicate username
        expect(signupRes.status).toBe(409);
    });

    test('login with wrong password returns 401', async () => {
        const username = uniqueUser('wrongpass');
        const password = 'pass123';

        await request(app)
            .post('/auth/signup')
            .send({ username, password });

        const loginRes = await request(app)
            .post('/auth/login')
            .send({ username, password: 'badpass' });
        // Expect unauthorized on invalid credentials
        expect(loginRes.status).toBe(401);
    });

    test('logout requires auth and succeeds with token', async () => {
        const username = uniqueUser('logout');
        const password = 'pass123';

        await request(app)
            .post('/auth/signup')
            .send({ username, password });

        const loginRes = await request(app)
            .post('/auth/login')
            .send({ username, password });
        const token = loginRes.body.token;

        const missingRes = await request(app).post('/auth/logout');
        // Expect auth required without token
        expect(missingRes.status).toBe(401);

        const logoutRes = await request(app)
            .post('/auth/logout')
            .set('Authorization', `Bearer ${token}`);
        // Expect successful logout with valid token
        expect(logoutRes.status).toBe(200);
        // Expect ok response body
        expect(logoutRes.body.ok).toBe(true);
    });
});
