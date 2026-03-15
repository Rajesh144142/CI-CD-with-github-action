// filepath: d:\CI-CD-and-testing\tests\unit\password.test.js
const { hashPassword, generateSalt, generateToken } = require('../../utils/password');

describe('Password utils (unit)', () => {
    test('hashPassword is deterministic for same password and salt', () => {
        const salt = 'salt123';
        const a = hashPassword('pass123', salt);
        const b = hashPassword('pass123', salt);
        // Expect same hash output for same input
        expect(a).toBe(b);
    });

    test('generateSalt returns non-empty string', () => {
        const salt = generateSalt();
        // Expect a string salt
        expect(typeof salt).toBe('string');
        // Expect non-empty value
        expect(salt.length).toBeGreaterThan(0);
    });

    test('generateToken returns non-empty string', () => {
        const token = generateToken();
        // Expect a string token
        expect(typeof token).toBe('string');
        // Expect non-empty value
        expect(token.length).toBeGreaterThan(0);
    });
});