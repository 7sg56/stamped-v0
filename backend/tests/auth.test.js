const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Increase timeout for server startup
jest.setTimeout(30000);

let mongoServer;

beforeAll(async () => {
  // Setup in-memory mongodb
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Set environment variables for the server
  process.env.MONGODB_URI = uri;
  process.env.PORT = '5002';
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret';

  // Start the server
  // Since server.js starts listening on import, this works.
  // We just need to make sure we wait a bit for it to be ready.
  require('../server');

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));
});

afterAll(async () => {
  if (mongoServer) {
    await mongoose.disconnect();
    await mongoServer.stop();
  }
  // The server process will die when jest finishes
});

describe('Auth API Verification', () => {
  let token;
  const adminCredentials = {
    username: 'testadmin',
    password: 'password123',
    confirmPassword: 'password123'
  };
  const baseURL = 'http://localhost:5002';

  test('POST /api/auth/register - Should register a new admin', async () => {
    const res = await request(baseURL)
      .post('/api/auth/register')
      .send(adminCredentials);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/auth/login - Should login and return token', async () => {
    const res = await request(baseURL)
      .post('/api/auth/login')
      .send({
        username: adminCredentials.username,
        password: adminCredentials.password
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  test('GET /api/auth/verify - Should verify token and return admin details', async () => {
    const res = await request(baseURL)
      .get('/api/auth/verify')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.admin).toBeDefined();
    expect(res.body.admin.username).toBe(adminCredentials.username);
    // Original implementation returns id
    expect(res.body.admin.id).toBeDefined();
  });

  test('GET /api/auth/verify - Should reject invalid token', async () => {
    const res = await request(baseURL)
      .get('/api/auth/verify')
      .set('Authorization', 'Bearer invalidtoken');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/auth/verify - Should reject missing token', async () => {
    const res = await request(baseURL)
      .get('/api/auth/verify');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
