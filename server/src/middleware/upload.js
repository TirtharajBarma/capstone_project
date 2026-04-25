import multer from 'multer';
import path from 'path';
import { fileTypeFromBuffer } from 'file-type';

// Configure storage
const storage = multer.memoryStorage(); // Store in memory for forwarding to ML API

// File filter function
// Note: This relies on mimetype which can be spoofed.
// We keep it for early rejection but MUST validate with magic numbers later.
const fileFilter = (req, file, cb) => {
  // Get allowed file types from environment
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/jpg',
    'image/png'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, and PNG images are allowed.'), false);
  }
};

// Create multer upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 1 // Only one file at a time
  }
});

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size allowed is 5MB.',
          error: 'FILE_TOO_LARGE'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files. Only one file is allowed.',
          error: 'TOO_MANY_FILES'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field.',
          error: 'UNEXPECTED_FILE'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'File upload error.',
          error: error.code
        });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message,
      error: 'INVALID_FILE_TYPE'
    });
  }
  
  next(error);
};

// Middleware to validate image upload
const validateImageUpload = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No image file provided. Please upload an image.',
      error: 'NO_FILE_UPLOADED'
    });
  }
  
  try {
    // Validate file type using Magic Numbers (inspecting buffer)
    const type = await fileTypeFromBuffer(req.file.buffer);

    // Allowed types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    if (!type || !allowedTypes.includes(type.mime)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file content. The file is not a valid image.',
        error: 'INVALID_FILE_CONTENT'
      });
    }

    // Add file metadata to request (using the verified mime type)
    req.fileMetadata = {
      originalName: req.file.originalname,
      mimetype: type.mime, // Use verified mime type
      size: req.file.size,
      buffer: req.file.buffer
    };

    next();
  } catch (error) {
    console.error('File validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error validating file.',
      error: 'VALIDATION_ERROR'
    });
  }
};

// Export upload middleware configurations
export const uploadSingle = upload.single('image');
export { handleUploadError, validateImageUpload };

export default upload;