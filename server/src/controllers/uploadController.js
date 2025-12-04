import cloudinary from '../config/cloudinary.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import fs from 'fs';

// @desc    Upload image to Cloudinary
// @route   POST /api/upload
// @access  Public (or Protected if needed)
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
    });
  }

  try {
    // Upload to Cloudinary using the buffer
    // Since we are using memory storage in multer (as seen in upload.js), we use upload_stream
    
    const uploadStream = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'cattle-breed-recognition', // Optional: organize in a folder
          },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        stream.write(buffer);
        stream.end();
      });
    };

    const result = await uploadStream(req.file.buffer);
    
    console.log('Cloudinary Upload Success:', {
      publicId: result.public_id,
      url: result.secure_url
    });

    res.status(200).json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
      },
      message: 'Image uploaded successfully',
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Image upload failed',
      error: error.message,
    });
  }
});
