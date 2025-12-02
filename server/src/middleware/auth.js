import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import dotenv from 'dotenv';

dotenv.config();

// Middleware to require authentication (Strict)
// This will automatically return 401 if the request is not authenticated
export const requireAuth = ClerkExpressRequireAuth({
  // Optional configuration
});

// Middleware to verify that the authenticated user matches the requested resource owner
export const requireOwner = (req, res, next) => {
  // If no auth object (middleware failed or wasn't used), unauthorized
  // With ClerkExpressRequireAuth, this should already be handled, but good for safety
  if (!req.auth || !req.auth.userId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: No session found'
    });
  }

  // clerkId can come from params (e.g., /users/profile/:clerkId) or body
  const requestedClerkId = req.params.clerkId || req.body.clerkId;

  if (!requestedClerkId) {
    // If we can't determine who is being requested, we might want to proceed
    // if the route doesn't require ownership, or fail.
    // For "requireOwner", we assume there IS a resource owner to check against.
    return res.status(400).json({
      success: false,
      message: 'Bad Request: Missing resource owner ID'
    });
  }

  // Check if the authenticated user is the one requested
  if (req.auth.userId !== requestedClerkId) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: You do not have permission to access this resource'
    });
  }

  next();
};
