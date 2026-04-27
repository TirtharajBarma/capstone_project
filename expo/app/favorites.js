import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserContext } from '../context/UserContext';
import { predictionAPI } from '../api/client';

export default function FavoritesScreen() {
  const router = useRouter();
  const { clerkUser } = useUserContext();
  
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [clerkUser?.id])
  );

  const loadFavorites = async () => {
    if (!clerkUser?.id) {
      setLoading(false);
      return;
    }

    try {
      const response = await predictionAPI.getFavorites(clerkUser.id);
      if (response.success && response.data?.predictions) {
        setFavorites(response.data.predictions);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.warn('Error loading favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  }, []);

  const handleGoBack = () => {
    router.back();
  };

  const handleFavoritePress = (prediction) => {
    const topPredictions = prediction.modelMetadata?.topPredictions || [{
      breed: prediction.predictedBreed,
      confidence: prediction.confidence,
    }];

    router.push({
      pathname: '/results',
      params: {
        prediction: JSON.stringify({
          breed: prediction.predictedBreed,
          species: prediction.species,
          confidence: prediction.confidence,
          topPredictions: topPredictions,
          inferenceTime: prediction.modelMetadata?.inferenceTime,
          isFavorite: prediction.isFavorite || false,
        }),
        imageUrl: prediction.imageUrl,
        predictionId: prediction._id,
        source: 'favorites',
      },
    });
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.7) return { bg: '#C1E1C1', text: '#166534' };
    if (confidence >= 0.2) return { bg: '#FEF3C7', text: '#92400E' };
    return { bg: '#FECACA', text: '#991B1B' };
  };

  const getCardBackgroundColor = (confidence) => {
    if (confidence > 0.8) return '#EDF3EB';
    if (confidence >= 0.3) return '#ECF0F0';
    return '#F7EBE7';
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const renderFavoriteCard = (prediction) => {
    return (
      <TouchableOpacity
        key={prediction._id}
        style={[styles.favoriteCard, { backgroundColor: getCardBackgroundColor(prediction.confidence) }]}
        activeOpacity={0.7}
        onPress={() => handleFavoritePress(prediction)}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: prediction.imageUrl || 'https://via.placeholder.com/80' }}
            style={styles.predictionImage}
          />
          <View style={styles.heartBadge}>
            <MaterialCommunityIcons name="heart" size={14} color="#FF6B6B" />
          </View>
        </View>

        <View style={styles.predictionInfo}>
          <Text style={styles.breedName} numberOfLines={1}>
            {prediction.predictedBreed}
          </Text>
          <View style={styles.confidenceRow}>
            <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(prediction.confidence).bg }]}>
              <Text style={[styles.confidenceText, { color: getConfidenceColor(prediction.confidence).text }]}>
                {Math.round(prediction.confidence * 100)}%
              </Text>
            </View>
            <Text style={styles.dateText}>{formatTime(prediction.createdAt)}</Text>
          </View>
          {prediction.species && (
            <View style={styles.speciesContainer}>
              <Text style={styles.speciesText}>
                {prediction.species.charAt(0).toUpperCase() + prediction.species.slice(1)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.chevronContainer}>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1C1B1F" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Favorites</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5D557D" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1C1B1F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorites</Text>
        <View style={{ width: 40 }} />
      </View>

      {favorites.length > 0 && (
        <View style={styles.countContainer}>
          <Text style={styles.countText}>
            {favorites.length} saved favorite{favorites.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#5D557D"
          />
        }
      >
        {favorites.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <MaterialCommunityIcons name="heart-outline" size={64} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the heart icon on any result to save it here
            </Text>
            <TouchableOpacity
              style={styles.startScanningButton}
              onPress={() => router.push('/scan')}
            >
              <Text style={styles.startScanningText}>Start Scanning</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.favoritesList}>
            {favorites.map(renderFavoriteCard)}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: '#F4F7FF',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1B1F',
  },
  countContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  countText: {
    fontSize: 14,
    color: '#5D557D',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoritesList: {
    gap: 12,
  },
  favoriteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  predictionImage: {
    width: '100%',
    height: '100%',
  },
  heartBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  predictionInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  breedName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1B1F',
    marginBottom: 6,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  confidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 13,
    color: '#6B7280',
  },
  speciesContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(93, 85, 125, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  speciesText: {
    fontSize: 12,
    color: '#5D557D',
    fontWeight: '500',
  },
  chevronContainer: {
    paddingLeft: 8,
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F4F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 20,
  },
  startScanningButton: {
    marginTop: 28,
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: '#5D557D',
    borderRadius: 999,
    shadowColor: 'rgba(93, 85, 125, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  startScanningText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});