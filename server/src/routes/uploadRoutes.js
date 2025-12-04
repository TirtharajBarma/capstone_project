import express from 'express';
import { uploadImage } from '../controllers/uploadController.js';
import { uploadSingle, handleUploadError, validateImageUpload } from '../middleware/upload.js';

const router = express.Router();

// @route   POST /api/upload
// @desc    Upload image to Cloudinary
// @access  Public
router.post('/', 
  uploadSingle, 
  handleUploadError, 
  validateImageUpload, 
  uploadImage
);

export default router;
