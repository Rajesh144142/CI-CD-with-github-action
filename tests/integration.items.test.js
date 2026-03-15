// filepath: d:\CI-CD-and-testing\tests\integration.items.test.js
const request = require('supertest');
const { app } = require('../app');
const { initTestDb, cleanupTestDb } = require('./testUtils');

function uniqueUser(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

async function signupAndLogin() {
  const username = uniqueUser('items');
  const password = 'pass123';

  await request(app).post('/auth/signup').send({ username, password });

  const loginRes = await request(app).post('/auth/login').send({ username, password });

  return loginRes.body.token;
}

beforeAll(async () => {
  await initTestDb();
});

afterAll(async () => {
  await cleanupTestDb();
});

describe('Items integration', () => {
  test('create, get, update, delete item', async () => {
    const token = await signupAndLogin();

    const createRes = await request(app)
      .post('/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'item-1', value: 'v1' });
    // Expect item creation success
    expect(createRes.status).toBe(201);
    // Expect created item name to match input
    expect(createRes.body.name).toBe('item-1');

    const itemId = createRes.body.id;

    const getRes = await request(app)
      .get(`/items/${itemId}`)
      .set('Authorization', `Bearer ${token}`);
    // Expect item fetch success
    expect(getRes.status).toBe(200);
    // Expect fetched item id to match
    expect(getRes.body.id).toBe(itemId);

    const updateRes = await request(app)
      .put(`/items/${itemId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'item-1-updated', value: 'v2' });
    // Expect item update success
    expect(updateRes.status).toBe(200);
    // Expect updated name to be returned
    expect(updateRes.body.name).toBe('item-1-updated');

    const deleteRes = await request(app)
      .delete(`/items/${itemId}`)
      .set('Authorization', `Bearer ${token}`);
    // Expect item delete success
    expect(deleteRes.status).toBe(200);
    // Expect ok response body
    expect(deleteRes.body.ok).toBe(true);
  });

  test('list items returns array', async () => {
    const token = await signupAndLogin();

    await request(app)
      .post('/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'item-a', value: 'va' });

    const listRes = await request(app).get('/items').set('Authorization', `Bearer ${token}`);
    // Expect list items success
    expect(listRes.status).toBe(200);
    // Expect items to be an array
    expect(Array.isArray(listRes.body.items)).toBe(true);
  });

  test('items requires auth', async () => {
    const listRes = await request(app).get('/items');
    // Expect auth required without token
    expect(listRes.status).toBe(401);
  });
});