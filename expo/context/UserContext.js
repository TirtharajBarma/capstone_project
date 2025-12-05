import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { userAPI, setClerkTokenGetter } from '../api/client';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const { isSignedIn, getToken, userId } = useAuth();
  const { user: clerkUser } = useUser();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set token getter for API client
  useEffect(() => {
    setClerkTokenGetter(getToken);
  }, [getToken]);

  // Sync user data with backend
  useEffect(() => {
    const syncUser = async () => {
      if (!isSignedIn || !clerkUser) {
        setUserData(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Sync with backend
        const clerkUserData = {
          id: clerkUser.id,
          emailAddresses: clerkUser.emailAddresses.map((email) => ({
            emailAddress: email.emailAddress,
            verification: email.verification,
            linkedTo: email.linkedTo,
          })),
          primaryEmailAddressId: clerkUser.primaryEmailAddressId,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          fullName: clerkUser.fullName,
          imageUrl: clerkUser.imageUrl,
          externalAccounts: clerkUser.externalAccounts.map((account) => ({
            provider: account.provider,
            providerUserId: account.providerUserId,
            emailAddress: account.emailAddress,
          })),
          createdAt: clerkUser.createdAt,
          updatedAt: clerkUser.updatedAt,
          lastSignInAt: clerkUser.lastSignInAt,
        };

        const response = await userAPI.syncUser(clerkUserData);
        setUserData(response.data);
      } catch (err) {
        console.error('Error syncing user:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    syncUser();
  }, [isSignedIn, clerkUser]);

  const refreshUserData = async () => {
    if (!userId) return;
    
    try {
      const response = await userAPI.getProfile(userId);
      setUserData(response.data);
    } catch (err) {
      console.error('Error refreshing user data:', err);
    }
  };

  const value = {
    userData,
    clerkUser,
    loading,
    error,
    isSignedIn,
    refreshUserData,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within UserProvider');
  }
  return context;
};
