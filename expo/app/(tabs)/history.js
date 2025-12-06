import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserContext } from '../../context/UserContext';
import { predictionAPI } from '../../api/client';

export default function HistoryScreen() {
  const router = useRouter();
  const { clerkUser } = useUserContext();
  
  const [predictions, setPredictions] = useState([]);
  const [filteredPredictions, setFilteredPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    filterPredictions();
  }, [predictions, searchQuery, activeFilter]);

  const loadHistory = async () => {
    if (!clerkUser?.id) {
      setLoading(false);
      return;
    }

    try {
      const response = await predictionAPI.getHistory(clerkUser.id, 100, 0);
      if (response.success && response.data?.predictions) {
        setPredictions(response.data.predictions);
      } else {
        setPredictions([]);
      }
    } catch (error) {
      console.error('Error loading history:', error);
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  }, []);

  const filterPredictions = () => {
    let filtered = [...predictions];

    // Apply species filter
    if (activeFilter === 'cattle') {
      filtered = filtered.filter(p => p.species === 'cattle');
    } else if (activeFilter === 'buffalo') {
      filtered = filtered.filter(p => p.species === 'buffalo');
    } else if (activeFilter === 'high') {
      filtered = filtered.filter(p => p.confidence >= 0.9);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(p =>
        p.predictedBreed.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPredictions(filtered);
  };

  const groupPredictionsByDate = () => {
    const groups = {
      today: [],
      yesterday: [],
      lastWeek: [],
      older: [],
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    filteredPredictions.forEach(prediction => {
      const predDate = new Date(prediction.createdAt);
      const predDateOnly = new Date(predDate.getFullYear(), predDate.getMonth(), predDate.getDate());

      if (predDateOnly.getTime() === today.getTime()) {
        groups.today.push(prediction);
      } else if (predDateOnly.getTime() === yesterday.getTime()) {
        groups.yesterday.push(prediction);
      } else if (predDate >= lastWeek) {
        groups.lastWeek.push(prediction);
      } else {
        groups.older.push(prediction);
      }
    });

    return groups;
  };

  const handleDelete = async (predictionId) => {
    Alert.alert(
      'Delete Prediction',
      'Are you sure you want to delete this prediction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await predictionAPI.deletePrediction(predictionId);
              setPredictions(prev => prev.filter(p => p._id !== predictionId));
            } catch (error) {
              console.error('Error deleting prediction:', error);
              Alert.alert('Error', 'Failed to delete prediction');
            }
          },
        },
      ]
    );
  };

  const getConfidenceColor = (confidence) => {
    // Above 70% = Green
    if (confidence >= 0.7) return { bg: '#C1E1C1', text: '#166534' };
    // 20-70% = Yellow
    if (confidence >= 0.2) return { bg: '#FEF3C7', text: '#92400E' };
    // Below 20% = Red
    return { bg: '#FECACA', text: '#991B1B' };
  };

  const getSpeciesBadgeColor = (species) => {
    if (species === 'cattle') return { bg: '#B2D8B4', text: '#166534' };
    if (species === 'buffalo') return { bg: '#DCD0FF', text: '#4C1D95' };
    return { bg: '#E5E7EB', text: '#6B7280' };
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays < 7) {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const renderPredictionItem = (prediction) => {
    const confidenceColors = getConfidenceColor(prediction.confidence);
    const speciesColors = getSpeciesBadgeColor(prediction.species);
    const shouldBlur = prediction.confidence < 0.3; // Blur only if below 30%

    return (
      <TouchableOpacity
        key={prediction._id}
        style={styles.predictionCard}
        activeOpacity={0.7}
        onPress={() => {
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
              source: 'history',
            },
          });
        }}
      >
        <View style={[styles.imageContainer, shouldBlur && styles.blurredImage]}>
          <Image
            source={{ uri: prediction.imageUrl || 'https://via.placeholder.com/72' }}
            style={styles.predictionImage}
          />
        </View>

        <View style={styles.predictionInfo}>
          <Text style={styles.breedName} numberOfLines={1}>
            {prediction.predictedBreed}
          </Text>
          <View style={styles.metaRow}>
            <View style={[styles.speciesBadge, { backgroundColor: speciesColors.bg }]}>
              <Text style={[styles.speciesText, { color: speciesColors.text }]}>
                {prediction.species.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.timeText}>{formatTime(prediction.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <View style={[styles.confidenceBadge, { backgroundColor: confidenceColors.bg }]}>
            <Text style={[styles.confidenceText, { color: confidenceColors.text }]}>
              {Math.round(prediction.confidence * 100)}%
            </Text>
          </View>
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => handleDelete(prediction._id)}
          >
            <MaterialCommunityIcons name="dots-vertical" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSection = (title, data, dotColor) => {
    if (data.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionDot, { backgroundColor: dotColor }]} />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.sectionContent}>
          {data.map(renderPredictionItem)}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={20} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Discoveries</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4cb2e6" />
        </View>
      </View>
    );
  }

  const groups = groupPredictionsByDate();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Discoveries</Text>
        <TouchableOpacity style={styles.headerButton}>
          <MaterialCommunityIcons name="tune" size={20} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search breeds (e.g., Holstein, Murrah)"
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
          onPress={() => setActiveFilter('all')}
        >
          <Text style={[styles.filterText, activeFilter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'cattle' && styles.filterChipActive]}
          onPress={() => setActiveFilter('cattle')}
        >
          <Text style={[styles.filterText, activeFilter === 'cattle' && styles.filterTextActive]}>
            Cows
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'buffalo' && styles.filterChipActive]}
          onPress={() => setActiveFilter('buffalo')}
        >
          <Text style={[styles.filterText, activeFilter === 'buffalo' && styles.filterTextActive]}>
            Buffalos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'high' && styles.filterChipActive]}
          onPress={() => setActiveFilter('high')}
        >
          <Text style={[styles.filterText, activeFilter === 'high' && styles.filterTextActive]}>
            High Confidence
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4cb2e6"
            colors={['#4cb2e6']}
          />
        }
      >
        {filteredPredictions.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="history" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No predictions found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try a different search term' : 'Start scanning to see your history'}
            </Text>
          </View>
        ) : (
          <>
            {renderSection('TODAY', groups.today, '#4cb2e6')}
            {renderSection('YESTERDAY', groups.yesterday, '#9CA3AF')}
            {renderSection('LAST WEEK', groups.lastWeek, '#9CA3AF')}
            {renderSection('OLDER', groups.older, '#9CA3AF')}
          </>
        )}
      </ScrollView>

      {/* Floating Scan Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        activeOpacity={0.8}
        onPress={() => router.push('/scan')}
      >
        <MaterialCommunityIcons name="camera" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: '#F6F7F8',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0e161b',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
    color: '#0e161b',
  },
  filterContainer: {
    flexGrow: 0,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterContent: {
    gap: 12,
    paddingRight: 16,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterChipActive: {
    backgroundColor: '#4cb2e6',
    shadowColor: '#4cb2e6',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6B7280',
    letterSpacing: 1.2,
  },
  sectionContent: {
    gap: 12,
  },
  predictionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  imageContainer: {
    width: 72,
    height: 72,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  blurredImage: {
    opacity: 0.4,
  },
  predictionImage: {
    width: '100%',
    height: '100%',
  },
  predictionInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  breedName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0e161b',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  speciesBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  speciesText: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
    marginLeft: 8,
  },
  confidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  moreButton: {
    padding: 4,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 96,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#A6C1EE',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A6C1EE',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
