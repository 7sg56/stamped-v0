// Mock standard modules first
const mockExpress = (() => {
  const app = {
    use: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    set: jest.fn(),
    listen: jest.fn(),
    disable: jest.fn(),
    enable: jest.fn(),
    engine: jest.fn(),
  };

  const express = jest.fn(() => app);
  express.json = jest.fn(() => (req, res, next) => next());
  express.urlencoded = jest.fn(() => (req, res, next) => next());
  express.static = jest.fn(() => (req, res, next) => next());
  express.Router = jest.fn(() => {
    const router = (req, res, next) => next();
    router.use = jest.fn();
    router.get = jest.fn();
    router.post = jest.fn();
    router.put = jest.fn();
    router.delete = jest.fn();
    return router;
  });

  return express;
})();

jest.mock('express', () => mockExpress, { virtual: true });

jest.mock('dotenv', () => ({
  config: jest.fn(),
}), { virtual: true });

jest.mock('cors', () => jest.fn(() => (req, res, next) => next()), { virtual: true });

// Mock local modules (these exist so no virtual needed usually, but safe to add if require fails)
// But require('../config/db') refers to a file that exists.
// Jest mock on existing file works without virtual.
jest.mock('../config/db', () => jest.fn());

// Mock mongoose (external dep)
const mockMongoose = {
  connection: {
    readyState: 1,
    host: 'mock-host',
    name: 'mock-db',
    db: {
      admin: () => ({
        ping: jest.fn().mockResolvedValue({ ok: 1 }),
      }),
    },
  },
  Schema: jest.fn(),
  model: jest.fn(),
  Types: {
    ObjectId: jest.fn(),
  },
};
// Add Schema methods mock
mockMongoose.Schema.prototype.pre = jest.fn();
mockMongoose.Schema.prototype.post = jest.fn();
mockMongoose.Schema.prototype.methods = {};
mockMongoose.Schema.prototype.statics = {};
mockMongoose.Schema.prototype.index = jest.fn();

// Add virtual: true for mongoose as it might be missing
jest.mock('mongoose', () => mockMongoose, { virtual: true });

// Mock other external deps that might be used
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue('salt'),
}), { virtual: true });

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}), { virtual: true });

jest.mock('multer', () => jest.fn(() => ({
  single: jest.fn(),
  array: jest.fn(),
})), { virtual: true });

jest.mock('uuid', () => ({ v4: jest.fn() }), { virtual: true });
jest.mock('qrcode', () => ({ toDataURL: jest.fn() }), { virtual: true });
jest.mock('exceljs', () => ({ Workbook: jest.fn() }), { virtual: true });
jest.mock('xlsx', () => ({ utils: {}, writeFile: jest.fn() }), { virtual: true });


// Mock route modules to avoid recursive requires that might fail due to missing deps inside them
// We mock them as dummy middleware
jest.mock('../routes/auth', () => (req, res, next) => next(), { virtual: true }); // Use virtual just in case
jest.mock('../routes/events', () => (req, res, next) => next(), { virtual: true });
jest.mock('../routes/registrations', () => (req, res, next) => next(), { virtual: true });
jest.mock('../routes/attendance', () => (req, res, next) => next(), { virtual: true });
jest.mock('../routes/dashboard', () => (req, res, next) => next(), { virtual: true });

jest.mock('../middleware/errorHandler', () => (err, req, res, next) => res.status(500).json({ error: 'Mock Error' }));

jest.mock('../middleware/requestLogger', () => ({
  errorLogger: (err, req, res, next) => next(err),
  requestLogger: (req, res, next) => next(),
  performanceMonitor: (req, res, next) => next(),
  requestId: (req, res, next) => next(),
}));

jest.mock('../utils/eventCleanup', () => ({
  startEventCleanupTask: jest.fn(),
}));

jest.mock('../models/Admin', () => ({
  createSuperAdmin: jest.fn().mockResolvedValue(),
}));


describe('Security Vulnerability Check', () => {
  let app;
  let apiRouter;

  beforeAll(() => {
    jest.resetModules();

    // Import server.js (app)
    app = require('../server');

    // Import routes/index.js (apiRouter)
    // apiRouter is likely a middleware function (express router)
    // require('../routes/index') returns what module.exports exports.
    // In backend/routes/index.js: module.exports = router;
    // router = express.Router();
    // In our mock, express.Router() returns a function with methods.
    apiRouter = require('../routes/index');
  });

  test('GET /health (server.js) does not expose system uptime', () => {
    // Find handler
    const healthCall = app.get.mock.calls.find(call => call[0] === '/health');
    expect(healthCall).toBeDefined();

    const handler = healthCall[1];

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
      removeHeader: jest.fn(),
    };

    handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const responseData = res.json.mock.calls[0][0];

    // Check for sensitive info (SECURE STATE)
    expect(responseData).not.toHaveProperty('uptime');
    expect(responseData).not.toHaveProperty('version');
    expect(responseData).not.toHaveProperty('environment');
    expect(responseData).toHaveProperty('status', 'healthy');
    expect(responseData).toHaveProperty('timestamp');
  });

  test('GET /api/health (routes/index.js) does not expose system info', async () => {
    // apiRouter is the mocked router function
    // We need to find the call to apiRouter.get('/health', ...)
    // Since apiRouter is a function returned by express.Router mock,
    // and we attached .get to it.

    const healthCall = apiRouter.get.mock.calls.find(call => call[0] === '/health');
    expect(healthCall).toBeDefined();

    const handler = healthCall[1];

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const responseData = res.json.mock.calls[0][0];

    // Check for sensitive info (SECURE STATE)
    expect(responseData).not.toHaveProperty('system');
    expect(responseData).not.toHaveProperty('version');
    expect(responseData.database).not.toHaveProperty('host');
    expect(responseData.database).not.toHaveProperty('name');
  });
});
