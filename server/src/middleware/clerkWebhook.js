import { Webhook } from 'svix';
import User from '../models/User.js';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export const handleClerkWebhook = async (req, res) => {
  try {
    const headers = req.headers;
    const payload = req.body;

    // Verify the webhook
    const wh = new Webhook(webhookSecret);
    let evt;

    try {
      evt = wh.verify(payload, headers);
    } catch (err) {
      console.error('Webhook verification failed:', err.message);
      return res.status(400).json({ error: 'Webhook verification failed' });
    }

    const { type, data } = evt;

    switch (type) {
      case 'user.created':
        await handleUserCreated(data);
        break;
        
      case 'user.updated':
        await handleUserUpdated(data);
        break;
        
      case 'user.deleted':
        await handleUserDeleted(data);
        break;
        
      default:
        console.warn(`Unhandled webhook type: ${type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const handleUserCreated = async (userData) => {
  try {
    // Creating user from webhook
    
    const user = await User.findOrCreateFromClerk(userData);
    // User created successfully
  } catch (error) {
    console.error('Error creating user from webhook:', error);
  }
};

const handleUserUpdated = async (userData) => {
  try {
    // Updating user from webhook
    
    const user = await User.findOrCreateFromClerk(userData);
    // User updated successfully
  } catch (error) {
    console.error('Error updating user from webhook:', error);
  }
};

const handleUserDeleted = async (userData) => {
  try {
    // Deleting user from webhook
    
    const deletedUser = await User.findOneAndDelete({ clerkId: userData.id });
    
    if (deletedUser) {
      // User deleted successfully
    } else {
      // User not found for deletion
    }
  } catch (error) {
    console.error('Error deleting user from webhook:', error);
  }
};