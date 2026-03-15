const request = require('supertest');
const { app } = require('../app');
const { initTestDb, cleanupTestDb } = require('./testUtils');

beforeAll(async () => {
    await initTestDb();
});

afterAll(async () => {
    await cleanupTestDb();
});

describe('Health integration', () => {
    test('db-health returns ok and count', async () => {
        const res = await request(app).get('/db-health');
        // Expect health check success
        expect(res.status).toBe(200);
        // Expect db to be ok
        expect(res.body.db).toBe('ok');
        // Expect rows to be a number
        expect(typeof res.body.rows).toBe('number');
    });
});
