import express from 'express';
import { uploadImage } from '../controllers/uploadController.js';
import { uploadSingle, handleUploadError, validateImageUpload } from '../middleware/upload.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/upload
// @desc    Upload image to Cloudinary
// @access  Protected
router.post('/', 
  requireAuth,
  uploadSingle, 
  handleUploadError, 
  validateImageUpload, 
  uploadImage
);

export default router;
