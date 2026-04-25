import request from 'supertest';
import { jest } from '@jest/globals';
import express from 'express';

// Mock the auth middleware
const mockRequireAuth = (req, res, next) => {
  req.auth = { userId: 'user_123' };
  next();
};

const mockRequireOwner = (req, res, next) => {
  if (req.params.clerkId && req.params.clerkId !== req.auth.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  next();
};

// Mock dependencies
jest.unstable_mockModule('@clerk/clerk-sdk-node', () => ({
  ClerkExpressRequireAuth: () => mockRequireAuth
}));

jest.unstable_mockModule('../src/middleware/auth.js', () => ({
  requireAuth: mockRequireAuth,
  requireOwner: mockRequireOwner
}));

jest.unstable_mockModule('../src/models/User.js', () => ({
  default: {
    findOrCreateFromClerk: jest.fn().mockResolvedValue({ isNew: false, id: 'user_123' }),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn()
  }
}));

jest.unstable_mockModule('../src/controllers/uploadController.js', () => ({
    uploadImage: (req, res) => res.status(200).json({ success: true, message: 'Upload success' })
}));

describe('Security Tests', () => {
  let app;
  let uploadMiddleware;

  beforeAll(async () => {
    // Setup Express App for Route Testing
    app = express();
    app.use(express.json());

    // Import controllers and routes
    const userRoutes = (await import('../src/routes/userRoutes.js')).default;
    const uploadRoutes = (await import('../src/routes/uploadRoutes.js')).default;

    // Mount routes
    app.use('/api/users', userRoutes);
    app.use('/api/upload', uploadRoutes);

    // Import the upload middleware directly to test the function logic
    const uploadModule = await import('../src/middleware/upload.js');
    uploadMiddleware = uploadModule.validateImageUpload;
  });

  describe('IDOR & Auth Protection', () => {
    test('POST /api/users/sync should allow if user ID matches token', async () => {
      const res = await request(app)
        .post('/api/users/sync')
        .send({ id: 'user_123', email: 'test@example.com' });

      expect(res.status).toBe(200);
    });

    test('POST /api/users/sync should reject if body ID does not match auth token', async () => {
       const res = await request(app)
         .post('/api/users/sync')
         .send({ id: 'user_456', email: 'hacker@example.com' });

       expect(res.status).toBe(403);
    });
  });

  describe('File Upload Validation', () => {
     test('should validate file buffer using magic numbers', async () => {
         // Mock req, res, next
         const req = {
             file: {
                 buffer: Buffer.from([0xFF, 0xD8, 0xFF]), // JPEG magic number
                 mimetype: 'image/jpeg', // Valid mime
                 size: 1024,
                 originalname: 'test.jpg'
             }
         };
         const res = {
             status: jest.fn().mockReturnThis(),
             json: jest.fn()
         };
         const next = jest.fn();

         await uploadMiddleware(req, res, next);

         expect(next).toHaveBeenCalled();
         expect(req.fileMetadata).toBeDefined();
         expect(req.fileMetadata.mimetype).toBe('image/jpeg');
     });

     test('should reject invalid file content even if mimetype is valid', async () => {
        // Mock req with fake image content (text file)
        const req = {
            file: {
                buffer: Buffer.from('this is not an image'),
                mimetype: 'image/jpeg', // Spoofed mime
                size: 1024,
                originalname: 'malicious.jpg'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await uploadMiddleware(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: 'INVALID_FILE_CONTENT'
        }));
    });
  });
});
