// filepath: d:\CI-CD-and-testing\tests\unit\auth.middleware.test.js
const { authRequired } = require('../../middleware/auth');

jest.mock('../../db', () => ({
    getDb: jest.fn(),
}));

const { getDb } = require('../../db');

function createRes() {
    const res = {};
    res.status = jest.fn(() => res);
    res.send = jest.fn(() => res);
    return res;
}

describe('Auth middleware (unit)', () => {
    test('returns 401 when no token provided', () => {
        getDb.mockReturnValue({});
        const req = { headers: {} };
        const res = createRes();
        const next = jest.fn();

        authRequired(req, res, next);

        // Expect auth required error
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith({ error: 'auth_required' });
        // Expect next not called
        expect(next).not.toHaveBeenCalled();
    });

    test('returns 503 when db not ready', () => {
        getDb.mockReturnValue(null);
        const req = { headers: { authorization: 'Bearer token' } };
        const res = createRes();
        const next = jest.fn();

        authRequired(req, res, next);

        // Expect db not ready error
        expect(res.status).toHaveBeenCalledWith(503);
        expect(res.send).toHaveBeenCalledWith({ error: 'db_not_ready' });
        // Expect next not called
        expect(next).not.toHaveBeenCalled();
    });
});