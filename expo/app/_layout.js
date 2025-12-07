import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Slot } from 'expo-router';
import { UserProvider } from '../context/UserContext';
import { ToastProvider } from '../context/ToastContext';
import BiometricAuth from '../components/BiometricAuth';
import { LogBox } from 'react-native';

// Ignore specific logs including the ugly "Uncaught promise" which we are now handling
LogBox.ignoreLogs([
   'Possible Unhandled Promise Rejection',
   'AxiosError',
]);

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error('Missing Clerk Publishable Key. Please add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file');
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <UserProvider>
          <ToastProvider>
            <BiometricAuth>
              <Slot />
            </BiometricAuth>
          </ToastProvider>
        </UserProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
