import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useUserContext } from '../../context/UserContext';
import { predictionAPI } from '../../api/client';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { clerkUser } = useUserContext();
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadRecentScans();
    }, [clerkUser?.id])
  );

  const loadRecentScans = async () => {
    if (!clerkUser?.id) return;
    
    try {
      const response = await predictionAPI.getHistory(clerkUser.id, 3, 0);
      if (response.success && response.data?.predictions) {
        setRecentScans(response.data.predictions);
      } else {
        setRecentScans([]);
      }
    } catch (error) {
      console.warn('Error loading recent scans:', error);
      setRecentScans([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecentScans();
    setRefreshing(false);
  };

  const openCamera = () => {
    router.push({
      pathname: '/scan',
      params: { source: 'camera' },
    });
  };

  const openGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
        allowsEditing: true,
        aspect: [3, 4],
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        router.push({
          pathname: '/scan',
          params: { imageUri: result.assets[0].uri, source: 'upload' },
        });
      }
    } catch (error) {
      console.warn('Error opening gallery:', error);
      Alert.alert('Gallery unavailable', 'Could not open your gallery. Please try again.');
    }
  };

  const firstName = clerkUser?.firstName || 'User';

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#7EC8A3"
            colors={['#7EC8A3']}
          />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome, {firstName}</Text>
          <Text style={styles.titleText}>
            Ready to{' '}
            <Text style={styles.titleHighlight}>identify?</Text>
          </Text>
          <Text style={styles.subtitleText}>
            Capture or upload to detect breeds instantly.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={[styles.actionCard, styles.cameraCard]}
            activeOpacity={0.8}
            onPress={openCamera}
          >
            <View style={[styles.iconCircle, styles.cameraIconCircle]}>
              <MaterialCommunityIcons name="camera" size={32} color="#2d7a58" />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, styles.cameraTitleColor]}>Camera</Text>
              <Text style={[styles.cardSubtitle, styles.cameraSubtitleColor]}>
                Take a new photo
              </Text>
            </View>
            <View style={styles.cardGlow} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, styles.uploadCard]}
            activeOpacity={0.8}
            onPress={openGallery}
          >
            <View style={[styles.iconCircle, styles.uploadIconCircle]}>
              <MaterialCommunityIcons name="image-plus" size={32} color="#5e3a75" />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, styles.uploadTitleColor]}>Upload</Text>
              <Text style={[styles.cardSubtitle, styles.uploadSubtitleColor]}>
                From gallery
              </Text>
            </View>
            <View style={styles.cardGlow} />
          </TouchableOpacity>
        </View>

        {/* Recent Scans Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Scans</Text>
          <TouchableOpacity onPress={() => router.push('/history')}>
            <Text style={styles.viewAllButton}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Scans Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recentScansContainer}
          style={styles.recentScansScroll}
        >
          {recentScans.map((scan, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.scanCard} 
              activeOpacity={0.9}
              onPress={() => {
                // Navigate to results page with complete scan data
                const topPredictions = scan.modelMetadata?.topPredictions || [{
                  breed: scan.predictedBreed,
                  confidence: scan.confidence,
                }];

                router.push({
                  pathname: '/results',
                  params: {
                    prediction: JSON.stringify({
                      breed: scan.predictedBreed,
                      species: scan.species,
                      confidence: scan.confidence,
                      topPredictions: topPredictions,
                      inferenceTime: scan.modelMetadata?.inferenceTime,
                      isFavorite: scan.isFavorite || false,
                    }),
                    imageUrl: scan.imageUrl,
                    predictionId: scan._id || scan.id,
                    source: 'home', // Track source page for back navigation
                  },
                });
              }}
            >
              <View style={styles.scanImageContainer}>
                <Image
                  source={{ uri: scan.imageUrl || 'https://via.placeholder.com/176x132' }}
                  style={styles.scanImage}
                />
                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceText}>
                    {Math.round((scan.confidence || 0) * 100)}%
                  </Text>
                </View>
              </View>
              <View style={styles.scanInfo}>
                <Text style={styles.scanBreed} numberOfLines={1}>
                  {scan.predictedBreed}
                </Text>
                <View style={styles.scanMeta}>
                  <MaterialCommunityIcons name="clock-outline" size={14} color="#9CA3AF" />
                  <Text style={styles.scanTime}>
                    {new Date(scan.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                    {', '}
                    {new Date(scan.createdAt).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {recentScans.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No recent scans yet</Text>
            </View>
          )}
        </ScrollView>

        {/* Did You Know Card */}
        <View style={styles.didYouKnowCard}>
          <View style={styles.bulbIconContainer}>
            <MaterialCommunityIcons name="lightbulb" size={20} color="#D97706" />
          </View>
          <View style={styles.didYouKnowContent}>
            <Text style={styles.didYouKnowTitle}>DID YOU KNOW?</Text>
            <Text style={styles.didYouKnowText}>
              The Murrah buffalo is often called the "Black Gold" of India due to its high milk production.
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F6',
  },
  contentContainer: {
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#FAF8F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a2c22',
  },
  welcomeSection: {
    paddingHorizontal: 24,
    paddingTop: 34,
    paddingBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9CA3AF',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  titleText: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#1a2c22',
    lineHeight: 52,
    marginBottom: 12,
  },
  titleHighlight: {
    color: '#7EC8A3',
  },
  subtitleText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 22,
  },
  actionGrid: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 64) / 2,
    minHeight: 176,
    borderRadius: 8,
    padding: 18,
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#102016',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  cameraCard: {
    backgroundColor: '#D9F4E7',
    borderColor: '#B7E5CF',
  },
  uploadCard: {
    backgroundColor: '#EEE2F2',
    borderColor: '#D7C0DF',
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIconCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  uploadIconCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  cardContent: {
    marginTop: 'auto',
  },
  cardTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    letterSpacing: 0,
  },
  cameraTitleColor: {
    color: '#133324',
  },
  uploadTitleColor: {
    color: '#2e1a3b',
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
    lineHeight: 18,
  },
  cameraSubtitleColor: {
    color: '#2d7a58',
  },
  uploadSubtitleColor: {
    color: '#5e3a75',
  },
  cardGlow: {
    position: 'absolute',
    top: -32,
    right: -32,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a2c22',
  },
  viewAllButton: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7EC8A3',
  },
  recentScansScroll: {
    paddingLeft: 24,
  },
  recentScansContainer: {
    paddingRight: 24,
    paddingVertical: 8,
    gap: 16,
  },
  scanCard: {
    width: 176,
    marginRight: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scanImageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  scanImage: {
    width: '100%',
    height: '100%',
  },
  confidenceBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  scanInfo: {
    paddingHorizontal: 4,
    paddingTop: 12,
    paddingBottom: 4,
  },
  scanBreed: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a2c22',
    marginBottom: 4,
  },
  scanMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scanTime: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  emptyState: {
    width: width - 48,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  didYouKnowCard: {
    flexDirection: 'row',
    gap: 16,
    marginHorizontal: 24,
    marginTop: 16,
    backgroundColor: '#FFF4BD',
    borderRadius: 16,
    padding: 20,
  },
  bulbIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(217, 119, 6, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  didYouKnowContent: {
    flex: 1,
  },
  didYouKnowTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4a3b10',
    opacity: 0.8,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  didYouKnowText: {
    fontSize: 14,
    color: '#4a3b10',
    lineHeight: 20,
  },
});
