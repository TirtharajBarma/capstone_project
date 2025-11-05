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
        console.log(`Unhandled webhook type: ${type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const handleUserCreated = async (userData) => {
  try {
    console.log('Creating user from webhook:', userData.id);
    
    const user = await User.findOrCreateFromClerk(userData);
    console.log('User created successfully:', user._id);
  } catch (error) {
    console.error('Error creating user from webhook:', error);
  }
};

const handleUserUpdated = async (userData) => {
  try {
    console.log('Updating user from webhook:', userData.id);
    
    const user = await User.findOrCreateFromClerk(userData);
    console.log('User updated successfully:', user._id);
  } catch (error) {
    console.error('Error updating user from webhook:', error);
  }
};

const handleUserDeleted = async (userData) => {
  try {
    console.log('Deleting user from webhook:', userData.id);
    
    const deletedUser = await User.findOneAndDelete({ clerkId: userData.id });
    
    if (deletedUser) {
      console.log('User deleted successfully:', deletedUser._id);
    } else {
      console.log('User not found for deletion:', userData.id);
    }
  } catch (error) {
    console.error('Error deleting user from webhook:', error);
  }
};