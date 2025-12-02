import { User } from '../models/index.js';

export const getUserFromClerkId = async (clerkId) => {
  if (!clerkId) return null;
  const user = await User.findOne({ clerkId }).select('_id clerkId');
  return user;
};
