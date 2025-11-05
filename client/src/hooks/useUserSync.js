import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { userAPI } from '../services/api';

export const useUserSync = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [dbUser, setDbUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync user data when Clerk user loads
  useEffect(() => {
    const syncUserData = async () => {
      if (!isLoaded || !isSignedIn || !user) {
        setDbUser(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Prepare Clerk user data for syncing
        const clerkUserData = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          emailAddresses: user.emailAddresses,
          imageUrl: user.imageUrl,
          externalAccounts: user.externalAccounts,
        };

        // Sync with MongoDB
        const response = await userAPI.syncUser(clerkUserData);
        setDbUser(response.data);
        
        console.log('User synced successfully:', response.message);
      } catch (error) {
        console.error('Failed to sync user:', error);
        setError(error.message || 'Failed to sync user data');
      } finally {
        setIsLoading(false);
      }
    };

    syncUserData();
  }, [user, isLoaded, isSignedIn]);

  // Function to increment prediction count
  const incrementPredictionCount = async () => {
    if (!user?.id) return;

    try {
      await userAPI.incrementPredictionCount(user.id);
      // Refresh user data to get updated stats
      const updatedUser = await userAPI.getProfile(user.id);
      setDbUser(updatedUser.data);
    } catch (error) {
      console.error('Failed to increment prediction count:', error);
    }
  };

  // Function to update preferences
  const updatePreferences = async (preferences) => {
    if (!user?.id) return;

    try {
      const response = await userAPI.updatePreferences(user.id, preferences);
      setDbUser(response.data);
      return response;
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw error;
    }
  };

  // Function to get user stats
  const getUserStats = async () => {
    if (!user?.id) return null;

    try {
      const response = await userAPI.getStats(user.id);
      return response.data;
    } catch (error) {
      console.error('Failed to get user stats:', error);
      return null;
    }
  };

  return {
    user: user, // Clerk user
    dbUser, // MongoDB user
    isLoading,
    error,
    isSignedIn,
    incrementPredictionCount,
    updatePreferences,
    getUserStats,
  };
};

export default useUserSync;