import express from 'express';
import { handleClerkWebhook } from '../middleware/clerkWebhook.js';

const router = express.Router();

// Clerk webhook endpoint
router.post('/clerk', express.raw({ type: 'application/json' }), handleClerkWebhook);

export default router;