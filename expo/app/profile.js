import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Image
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth, useClerk } from '@clerk/clerk-expo';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useUserContext } from '../context/UserContext';
import { userAPI } from '../api/client';

// Custom Components defined inline to ensure exact styling match
const StatCard = ({ title, value, backgroundColor, fullWidth }) => (
  <View style={[
    styles.statCard, 
    { backgroundColor },
    fullWidth && styles.statCardFullWidth
  ]}>
    <Text style={styles.statTitle}>{title}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const MenuItem = ({ icon, title, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuItemLeft}>
      <View style={styles.menuIconContainer}>
        <MaterialCommunityIcons name={icon} size={20} color="#1F2937" />
      </View>
      <Text style={styles.menuItemTitle}>{title}</Text>
    </View>
    <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const { signOut } = useClerk();
  const { clerkUser } = useUserContext();

  const [stats, setStats] = useState({
    scansMade: 0,
    breedsIdentified: 0,
    favoritesSaved: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [userId]);

  const loadStats = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      // Use getAnalytics to get the calculated stats including unique breeds
      const response = await userAPI.getAnalytics(userId);
      if (response.success) {
        setStats({
          scansMade: response.data.totalAnalyses || 0,
          breedsIdentified: response.data.uniqueBreeds || 0,
          favoritesSaved: 0, // Not currently returned by analytics endpoint
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => router.push('/edit-profile');
  const handleAppSettings = () => Alert.alert('App Settings', 'Coming soon!');
  const handleHelpSupport = () => Alert.alert('Help & Support', 'Coming soon!');
  const handlePrivacyPolicy = () => Alert.alert('Privacy Policy', 'Coming soon!');

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/(auth)/sign-in');
          } catch (error) {
            console.error(error);
          }
        },
      },
    ]);
  };

  const name = clerkUser?.fullName || 'User';
  const email = clerkUser?.primaryEmailAddress?.emailAddress || 'No email';
  const imageUrl = clerkUser?.imageUrl;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUrl || 'https://via.placeholder.com/128' }}
              style={styles.profileImage}
            />
          </View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard
              title="Scans Made"
              value={stats.scansMade}
              backgroundColor="#FDECC8" // Cream/Yellow
            />
            <StatCard
              title="Breeds Identified"
              value={stats.breedsIdentified}
              backgroundColor="#B2C7D9" // Light Blue
            />
          </View>
          <StatCard
            title="Favorites Saved"
            value={stats.favoritesSaved}
            backgroundColor="#D1E4D5" // Light Green
            fullWidth
          />
        </View>

        {/* Menu Sections */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionHeader}>ACCOUNT</Text>
          <View style={styles.menuGroup}>
            <MenuItem icon="cog-outline" title="Settings" onPress={handleEditProfile} />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionHeader}>SUPPORT</Text>
          <View style={styles.menuGroup}>
            <MenuItem icon="help-circle-outline" title="Help & Support" onPress={handleHelpSupport} />
            <MenuItem icon="shield-check-outline" title="Privacy Policy" onPress={handlePrivacyPolicy} />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF8F6', // Light background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FAF8F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#10B981', // Green badge
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FAFAFA',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsGrid: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  statCardFullWidth: {
    width: '100%',
    flex: 0,
  },
  statTitle: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9CA3AF',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  menuGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemTitle: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  logoutButton: {
    marginHorizontal: 20,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 40,
    marginTop: 24,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
});
