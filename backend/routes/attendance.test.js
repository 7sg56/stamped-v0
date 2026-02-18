const express = require('express');
const mongoose = require('mongoose');

// Mock dependencies
jest.mock('../models', () => ({
  Event: {
    findById: jest.fn()
  },
  Participant: {
    find: jest.fn()
  }
}));

jest.mock('../utils/qr', () => ({
  parseQRCode: jest.fn()
}));

jest.mock('../middleware/auth', () => (req, res, next) => {
  req.user = { id: 'organizer_id', isSuperAdmin: false };
  next();
});

// Mock the csv utility specifically to verify it's called
const mockGenerateAttendanceExport = jest.fn();
const mockGenerateExportFilename = jest.fn();
jest.mock('../utils/csv', () => ({
  generateAttendanceExport: mockGenerateAttendanceExport,
  generateExportFilename: mockGenerateExportFilename
}));

describe('Attendance Route Export', () => {
  let attendanceRouter;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules(); // Ensure fresh import
    attendanceRouter = require('./attendance');
  });

  it('should call generateAttendanceExport and return excel file', async () => {
    const { Event, Participant } = require('../models');

    // Setup mocks
    const mockEvent = {
      _id: '507f1f77bcf86cd799439011',
      title: 'Test Event',
      organizer: 'organizer_id',
      toString: () => 'event_id'
    };
    Event.findById.mockResolvedValue(mockEvent);

    const mockFind = jest.fn().mockReturnThis(); // Mocking chaining
    const mockSort = jest.fn().mockReturnThis();
    const mockLean = jest.fn().mockResolvedValue([{ name: 'Participant 1' }]);

    // Because Participant.find returns the query object (which we mock as returning `this`),
    // calls are chained on the return value of find().
    // We mock find() to return an object that has sort() and lean().
    Participant.find.mockReturnValue({
      sort: mockSort,
      lean: mockLean
    });

    // Mock implementations
    mockGenerateAttendanceExport.mockResolvedValue(Buffer.from('excel data'));
    mockGenerateExportFilename.mockReturnValue('filename.xlsx');

    // Find the handler
    const stackLayer = attendanceRouter.stack.find(
      layer => layer.route && layer.route.path === '/export/:eventId' && layer.route.methods.get
    );
    expect(stackLayer).toBeDefined();

    // The handler function is the last function in the route's stack
    const handler = stackLayer.route.stack[stackLayer.route.stack.length - 1].handle;

    // Create mock request and response
    const req = {
      method: 'GET',
      url: '/export/507f1f77bcf86cd799439011',
      params: { eventId: '507f1f77bcf86cd799439011' },
      user: { id: 'organizer_id', isSuperAdmin: false }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
      setHeader: jest.fn()
    };

    const next = jest.fn();

    // Call the handler
    await handler(req, res, next);

    // Assertions
    expect(Event.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    expect(Participant.find).toHaveBeenCalledWith({ eventId: '507f1f77bcf86cd799439011' });
    expect(mockGenerateAttendanceExport).toHaveBeenCalled();
    expect(mockGenerateExportFilename).toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    expect(res.send).toHaveBeenCalledWith(expect.any(Buffer));
  });
});
