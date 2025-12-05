import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  TextInput
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

export default function BiometricAuth({ children }) {
  const [isLocked, setIsLocked] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [appPassword, setAppPassword] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState('');

  useEffect(() => {
    checkSecuritySettings();
  }, []);

  // Re-check when the app comes into focus (optional, but good for "close and reopen" feel if using navigation)
  // For true "close app" (kill process), useEffect is enough.
  // But if they background it, we might want AppState listener. 
  // For now, let's stick to initial mount which covers "close and reopen".

  const checkSecuritySettings = async () => {
    try {
      const bioEnabled = await SecureStore.getItemAsync('biometrics_enabled');
      const storedPass = await SecureStore.getItemAsync('app_password');

      setBiometricsEnabled(bioEnabled === 'true');
      setAppPassword(storedPass);

      // Skip biometric lock in Expo Go due to permission limitations
      // Face ID will work in production builds
      console.log('Security check: Biometrics enabled:', bioEnabled, 'App password:', !!storedPass);
      setIsLocked(false);
      setLoading(false);
      
      /* 
      // Uncomment this for production build:
      if (bioEnabled === 'true' || storedPass) {
        setIsLocked(true);
        if (bioEnabled === 'true') {
          authenticateWithBiometrics();
        } else {
          setShowPinInput(true);
          setLoading(false);
        }
      } else {
        setIsLocked(false);
        setLoading(false);
      }
      */
    } catch (error) {
      console.error('Security check error:', error);
      setIsLocked(false);
      setLoading(false);
    }
  };

  const authenticateWithBiometrics = async () => {
    try {
      console.log('Starting biometric authentication...');
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      
      console.log('Hardware compatible:', compatible);
      console.log('Biometrics enrolled:', enrolled);
      
      if (!compatible || !enrolled) {
        Alert.alert(
          'Biometrics Not Available',
          'Please enable Face ID in your device settings or use App Password.',
          [{ text: 'OK', onPress: () => setShowPinInput(true) }]
        );
        setLoading(false);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock App',
        cancelLabel: 'Cancel',
        disableDeviceFallback: true,
        fallbackLabel: '',
      });

      console.log('Biometric result:', result);

      if (result.success) {
        setIsLocked(false);
        setLoading(false);
      } else {
        // If biometric fails/cancelled, stop loading and show unlock screen
        setLoading(false);
      }
    } catch (error) {
      console.error('Biometric auth error:', error);
      Alert.alert('Error', 'Biometric authentication failed. Please try again.');
      setLoading(false);
    }
  };

  const handlePinSubmit = () => {
    if (pin === appPassword) {
      setIsLocked(false);
    } else {
      Alert.alert('Error', 'Incorrect Password');
      setPin('');
    }
  };

  if (!isLocked) {
    return children;
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#A8D0B5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="shield-lock" size={80} color="#A8D0B5" />
        </View>
        <Text style={styles.title}>App Locked</Text>
        <Text style={styles.subtitle}>
          {showPinInput ? 'Enter App Password' : 'Authentication Required'}
        </Text>

        {showPinInput ? (
          <View style={styles.pinContainer}>
            <TextInput
              style={styles.pinInput}
              value={pin}
              onChangeText={setPin}
              placeholder="Enter 4-digit PIN"
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              autoFocus
            />
            <TouchableOpacity style={styles.button} onPress={handlePinSubmit}>
              <Text style={styles.buttonText}>Unlock</Text>
            </TouchableOpacity>
            
            {biometricsEnabled && (
              <TouchableOpacity 
                style={styles.secondaryButton} 
                onPress={() => {
                  setShowPinInput(false);
                  authenticateWithBiometrics();
                }}
              >
                <Text style={styles.secondaryButtonText}>Use Face ID</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            {biometricsEnabled && (
              <TouchableOpacity 
                style={styles.button} 
                onPress={() => {
                  console.log('Button pressed');
                  authenticateWithBiometrics();
                }}
              >
                <MaterialCommunityIcons name="face-recognition" size={24} color="#FFFFFF" style={{ marginRight: 10 }} />
                <Text style={styles.buttonText}>Unlock with Face ID</Text>
              </TouchableOpacity>
            )}
            
            {appPassword && (
              <TouchableOpacity 
                style={[styles.button, styles.pinButton]} 
                onPress={() => setShowPinInput(true)}
              >
                <MaterialCommunityIcons name="dialpad" size={24} color="#374151" style={{ marginRight: 10 }} />
                <Text style={[styles.buttonText, styles.pinButtonText]}>Use App Password</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#F0FDF4',
    borderRadius: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  pinContainer: {
    width: '100%',
    gap: 16,
  },
  pinInput: {
    width: '100%',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  button: {
    width: '100%',
    height: 56,
    backgroundColor: '#A8D0B5',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#A8D0B5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pinButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
  },
  pinButtonText: {
    color: '#374151',
  },
  secondaryButton: {
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
});
