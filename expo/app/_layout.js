import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Stack } from 'expo-router';
import { UserProvider } from '../context/UserContext';
import { ToastProvider } from '../context/ToastContext';
import BiometricAuth from '../components/BiometricAuth';
import { LogBox, useColorScheme } from 'react-native';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
    <SafeAreaProvider>
      <ThemeProvider value={DefaultTheme}>
        <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
          <ClerkLoaded>
            <UserProvider>
              <ToastProvider>
                <BiometricAuth>
                  <Stack screenOptions={{ headerShown: false }} />
                </BiometricAuth>
              </ToastProvider>
            </UserProvider>
          </ClerkLoaded>
        </ClerkProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
