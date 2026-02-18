
// Virtual mock for qrcode since it might not be installed
jest.mock('qrcode', () => ({
  toDataURL: jest.fn(),
  toBuffer: jest.fn()
}), { virtual: true });

const { generateQRCode, generateQRCodeBuffer, parseQRCode, isValidQRCodeFormat } = require('../utils/qr');
const QRCode = require('qrcode');

describe('QR Code Generation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateQRCode', () => {
    it('should generate QR code successfully', async () => {
      QRCode.toDataURL.mockResolvedValue('data:image/png;base64,mockedData');
      const result = await generateQRCode('event123', 'reg456');
      expect(result).toBe('data:image/png;base64,mockedData');
      expect(QRCode.toDataURL).toHaveBeenCalledWith(
        'event123:reg456',
        expect.objectContaining({
          errorCorrectionLevel: 'M',
          type: 'image/png',
          quality: 0.92,
          margin: 1,
          color: { dark: '#000000', light: '#FFFFFF' }
        })
      );
    });

    it('should throw error if eventId or registrationId is missing', async () => {
      await expect(generateQRCode('', 'reg456')).rejects.toThrow('EventId and registrationId are required');
      await expect(generateQRCode('event123', '')).rejects.toThrow('EventId and registrationId are required');
    });

    it('should handle QRCode generation error', async () => {
      QRCode.toDataURL.mockRejectedValue(new Error('Generation failed'));
      await expect(generateQRCode('event123', 'reg456')).rejects.toThrow('Failed to generate QR code: Generation failed');
    });
  });

  describe('generateQRCodeBuffer', () => {
    it('should generate QR code buffer successfully', async () => {
      const mockBuffer = Buffer.from('mockedBuffer');
      QRCode.toBuffer.mockResolvedValue(mockBuffer);
      const result = await generateQRCodeBuffer('event123', 'reg456');
      expect(result).toBe(mockBuffer);
      expect(QRCode.toBuffer).toHaveBeenCalledWith(
        'event123:reg456',
        expect.objectContaining({
          errorCorrectionLevel: 'M',
          type: 'png',
          quality: 0.92,
          margin: 1,
          color: { dark: '#000000', light: '#FFFFFF' }
        })
      );
    });

    it('should throw error if eventId or registrationId is missing', async () => {
      await expect(generateQRCodeBuffer('', 'reg456')).rejects.toThrow('EventId and registrationId are required');
      await expect(generateQRCodeBuffer('event123', '')).rejects.toThrow('EventId and registrationId are required');
    });

    it('should handle QRCode buffer generation error', async () => {
      QRCode.toBuffer.mockRejectedValue(new Error('Buffer failed'));
      await expect(generateQRCodeBuffer('event123', 'reg456')).rejects.toThrow('Failed to generate QR code buffer: Buffer failed');
    });
  });

  describe('parseQRCode', () => {
    it('should parse valid QR code', () => {
      const result = parseQRCode('event123:reg456');
      expect(result).toEqual({ eventId: 'event123', registrationId: 'reg456' });
    });

    it('should throw error for invalid format', () => {
      expect(() => parseQRCode('invalid')).toThrow('Invalid QR code format');
    });

    it('should throw error for empty fields', () => {
      expect(() => parseQRCode(':')).toThrow('EventId and registrationId cannot be empty');
      expect(() => parseQRCode('event123:')).toThrow('EventId and registrationId cannot be empty');
      expect(() => parseQRCode(':reg456')).toThrow('EventId and registrationId cannot be empty');
    });

    it('should throw error for invalid data type', () => {
      expect(() => parseQRCode(null)).toThrow('Invalid QR code data');
    });
  });

  describe('isValidQRCodeFormat', () => {
    it('should return true for valid QR code', () => {
      expect(isValidQRCodeFormat('event123:reg456')).toBe(true);
    });

    it('should return false for invalid QR code', () => {
      expect(isValidQRCodeFormat('invalid')).toBe(false);
      expect(isValidQRCodeFormat('event123:')).toBe(false);
      expect(isValidQRCodeFormat(null)).toBe(false);
    });
  });
});
