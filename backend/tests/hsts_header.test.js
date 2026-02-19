const request = require('supertest');

// Mock dependencies that might cause issues or are not needed for this test
jest.mock('../routes', () => (req, res, next) => next());
jest.mock('../config/db', () => jest.fn());
jest.mock('../models/Admin', () => ({
  createSuperAdmin: jest.fn().mockResolvedValue(),
}));

// We need to require server AFTER mocking
const app = require('../server');

describe('Security Headers', () => {
  it('should have HSTS header', async () => {
    const res = await request(app).get('/health');
    console.log('Headers:', res.headers);

    // Check for HSTS header
    // It should be 'strict-transport-security' (lowercase in node headers)
    expect(res.headers['strict-transport-security']).toBeDefined();
    expect(res.headers['strict-transport-security']).toBe('max-age=31536000; includeSubDomains');
  });
});
