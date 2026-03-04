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
  Share,
  Modal,
  Pressable,
  Platform,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter, useFocusEffect } from 'expo-router';
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
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    species: 'all',
    confidence: 'all',
    dateRange: 'all',
  });

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [clerkUser?.id]) // Re-run when user changes, but useFocusEffect handles focus changes
  );

  useEffect(() => {
    filterPredictions();
  }, [predictions, searchQuery, activeFilter, tempFilters]);

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
      console.warn('Error loading history:', error);
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

    // Apply species filter from quick chips
    if (activeFilter === 'cattle') {
      filtered = filtered.filter(p => p.species === 'cattle');
    } else if (activeFilter === 'buffalo') {
      filtered = filtered.filter(p => p.species === 'buffalo');
    } else if (activeFilter === 'high') {
      filtered = filtered.filter(p => p.confidence >= 0.7);
    }

    // Apply advanced filters from modal
    if (tempFilters.species !== 'all') {
      filtered = filtered.filter(p => p.species === tempFilters.species);
    }

    if (tempFilters.confidence === 'high') {
      filtered = filtered.filter(p => p.confidence >= 0.7);
    } else if (tempFilters.confidence === 'medium') {
      filtered = filtered.filter(p => p.confidence >= 0.2 && p.confidence < 0.7);
    } else if (tempFilters.confidence === 'low') {
      filtered = filtered.filter(p => p.confidence < 0.2);
    }

    if (tempFilters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (tempFilters.dateRange === 'today') {
        filtered = filtered.filter(p => new Date(p.createdAt) >= today);
      } else if (tempFilters.dateRange === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter(p => new Date(p.createdAt) >= weekAgo);
      } else if (tempFilters.dateRange === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filtered = filtered.filter(p => new Date(p.createdAt) >= monthAgo);
      }
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(p =>
        p.predictedBreed.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPredictions(filtered);
  };



  const handleShare = async (prediction) => {
    try {
      const message = `Check out this ${prediction.species} breed: ${prediction.predictedBreed} (${Math.round(prediction.confidence * 100)}% confidence)`;
      
      await Share.share({
        message: message,
        url: prediction.imageUrl,
        title: `${prediction.predictedBreed} - Cattle Identifier`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDelete = async (predictionId) => {
    Alert.alert(
      'Delete Prediction',
      'Are you sure you want to delete this prediction? This will permanently remove it from your history and delete the image from storage.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await predictionAPI.delete(predictionId);
              if (response.success) {
                setPredictions(prev => prev.filter(p => p._id !== predictionId));
                Alert.alert('Success', 'Prediction deleted successfully');
              } else {
                Alert.alert('Error', response.message || 'Failed to delete prediction');
              }
            } catch (error) {
              console.error('Error deleting prediction:', error);
              const errorMessage = error.response?.data?.message || 'Failed to delete prediction. Please try again.';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const showActionSheet = (prediction, event) => {
    // Use nativeEvent.pageY and pageX for absolute positioning
    const { pageX, pageY } = event.nativeEvent;
    
    setMenuPosition({
      x: pageX - 250, // Menu width is 250, so position it to the left of touch point
      y: pageY - 5,  // Slightly above the touch point
    });
    setSelectedPrediction(prediction);
    setShowActionModal(true);
  };

  const closeActionModal = () => {
    setShowActionModal(false);
    setTimeout(() => setSelectedPrediction(null), 300);
  };

  const handleActionShare = () => {
    closeActionModal();
    setTimeout(() => {
      if (selectedPrediction) {
        handleShare(selectedPrediction);
      }
    }, 300);
  };

  const handleActionDelete = () => {
    closeActionModal();
    setTimeout(() => {
      if (selectedPrediction) {
        handleDelete(selectedPrediction._id);
      }
    }, 300);
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


    const getCardBackgroundColor = (confidence) => {
      // > 80% (0.8): #EDF3EB
      // 30-79% (0.3 - 0.79): #ECF0F0
      // < 30% (0.3): #F7EBE7
      if (confidence > 0.8) return '#EDF3EB';
      if (confidence >= 0.3) return '#ECF0F0';
      return '#F7EBE7';
    };


    return (
      <TouchableOpacity
        key={prediction._id}
        style={[styles.predictionCard, { backgroundColor: getCardBackgroundColor(prediction.confidence) }]}
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
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: prediction.imageUrl || 'https://via.placeholder.com/72' }}
            style={styles.predictionImage}
          />
        </View>

        <View style={styles.predictionInfo}>
          <Text style={styles.breedName} numberOfLines={1}>
            {prediction.predictedBreed}
          </Text>
          <Text style={styles.subtitleText}>
            {Math.round(prediction.confidence * 100)}% Match - {formatTime(prediction.createdAt)}
          </Text>
        </View>

        <View style={styles.rightSection}>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderSection = (title, data, dotColor) => {
    if (data.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4cb2e6" />
        </View>
      </View>
    );
  }

  const groupPredictionsByDate = () => {
    const sections = [];
    const todayData = [];
    const yesterdayData = [];
    const lastWeekData = [];
    const monthGroups = new Map();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeekThreshold = new Date(today);
    lastWeekThreshold.setDate(lastWeekThreshold.getDate() - 7);

    filteredPredictions.forEach(prediction => {
      const predDate = new Date(prediction.createdAt);
      const predDateOnly = new Date(predDate.getFullYear(), predDate.getMonth(), predDate.getDate());

      if (predDateOnly.getTime() === today.getTime()) {
        todayData.push(prediction);
      } else if (predDateOnly.getTime() === yesterday.getTime()) {
        yesterdayData.push(prediction);
      } else if (predDateOnly >= lastWeekThreshold) {
        lastWeekData.push(prediction);
      } else {
        const monthYear = predDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        if (!monthGroups.has(monthYear)) {
          monthGroups.set(monthYear, []);
        }
        monthGroups.get(monthYear).push(prediction);
      }
    });

    if (todayData.length > 0) {
      sections.push({ title: 'Today', data: todayData, color: '#4cb2e6' });
    }
    if (yesterdayData.length > 0) {
      sections.push({ title: 'Yesterday', data: yesterdayData, color: '#9CA3AF' });
    }
    if (lastWeekData.length > 0) {
      sections.push({ title: 'Last Week', data: lastWeekData, color: '#9CA3AF' });
    }
    
    monthGroups.forEach((data, title) => {
      sections.push({ title, data, color: '#9CA3AF' });
    });

    return sections;
  };

  const sections = groupPredictionsByDate();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>History</Text>
        <TouchableOpacity style={styles.headerButton} onPress={() => setShowFilterModal(true)}>
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
            title="Pull to refresh"
            titleColor="#9CA3AF"
            colors={['#4cb2e6']}
          />
        }
      >
        {/* Pull to Refresh Hint */}
        <Text style={styles.pullToRefreshHint}>↓ Pull down to refresh</Text>

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
            {sections.map((section, index) => (
              <View key={index}>
                {renderSection(section.title, section.data, section.color)}
              </View>
            ))}
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

      {/* Liquid Glass Action Menu */}
      <Modal
        visible={showActionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeActionModal}
      >
        <Pressable style={styles.glassModalOverlay} onPress={closeActionModal}>
          <View 
            style={[
              styles.glassMenuContainer,
              {
                position: 'absolute',
                top: menuPosition.y,
                left: menuPosition.x,
              }
            ]}
          >
            <BlurView intensity={95} tint="dark" style={styles.glassMenu}>
              <TouchableOpacity
                style={styles.glassMenuItem}
                activeOpacity={0.7}
                onPress={handleActionShare}
              >
                <MaterialCommunityIcons name="share-variant-outline" size={20} color="#FFF" />
                <Text style={styles.glassMenuText}>Share</Text>
              </TouchableOpacity>

              <View style={styles.glassMenuDivider} />

              <TouchableOpacity
                style={styles.glassMenuItem}
                activeOpacity={0.7}
                onPress={handleActionDelete}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={20} color="#FF453A" />
                <Text style={[styles.glassMenuText, styles.deleteMenuText]}>Delete</Text>
              </TouchableOpacity>
            </BlurView>
          </View>
        </Pressable>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowFilterModal(false)}>
          <Pressable style={styles.filterModalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            
            <Text style={styles.filterModalTitle}>Filter History</Text>

            {/* Species Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Species</Text>
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[styles.filterOption, tempFilters.species === 'all' && styles.filterOptionActive]}
                  onPress={() => setTempFilters({ ...tempFilters, species: 'all' })}
                >
                  <Text style={[styles.filterOptionText, tempFilters.species === 'all' && styles.filterOptionTextActive]}>
                    All
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterOption, tempFilters.species === 'cattle' && styles.filterOptionActive]}
                  onPress={() => setTempFilters({ ...tempFilters, species: 'cattle' })}
                >
                  <Text style={[styles.filterOptionText, tempFilters.species === 'cattle' && styles.filterOptionTextActive]}>
                    Cattle
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterOption, tempFilters.species === 'buffalo' && styles.filterOptionActive]}
                  onPress={() => setTempFilters({ ...tempFilters, species: 'buffalo' })}
                >
                  <Text style={[styles.filterOptionText, tempFilters.species === 'buffalo' && styles.filterOptionTextActive]}>
                    Buffalo
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Confidence Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Confidence Level</Text>
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[styles.filterOption, tempFilters.confidence === 'all' && styles.filterOptionActive]}
                  onPress={() => setTempFilters({ ...tempFilters, confidence: 'all' })}
                >
                  <Text style={[styles.filterOptionText, tempFilters.confidence === 'all' && styles.filterOptionTextActive]}>
                    All
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterOption, tempFilters.confidence === 'high' && styles.filterOptionActive]}
                  onPress={() => setTempFilters({ ...tempFilters, confidence: 'high' })}
                >
                  <Text style={[styles.filterOptionText, tempFilters.confidence === 'high' && styles.filterOptionTextActive]}>
                    High (70%+)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterOption, tempFilters.confidence === 'medium' && styles.filterOptionActive]}
                  onPress={() => setTempFilters({ ...tempFilters, confidence: 'medium' })}
                >
                  <Text style={[styles.filterOptionText, tempFilters.confidence === 'medium' && styles.filterOptionTextActive]}>
                    Medium (20-70%)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterOption, tempFilters.confidence === 'low' && styles.filterOptionActive]}
                  onPress={() => setTempFilters({ ...tempFilters, confidence: 'low' })}
                >
                  <Text style={[styles.filterOptionText, tempFilters.confidence === 'low' && styles.filterOptionTextActive]}>
                    Low (&lt;20%)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Date Range Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Date Range</Text>
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[styles.filterOption, tempFilters.dateRange === 'all' && styles.filterOptionActive]}
                  onPress={() => setTempFilters({ ...tempFilters, dateRange: 'all' })}
                >
                  <Text style={[styles.filterOptionText, tempFilters.dateRange === 'all' && styles.filterOptionTextActive]}>
                    All Time
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterOption, tempFilters.dateRange === 'today' && styles.filterOptionActive]}
                  onPress={() => setTempFilters({ ...tempFilters, dateRange: 'today' })}
                >
                  <Text style={[styles.filterOptionText, tempFilters.dateRange === 'today' && styles.filterOptionTextActive]}>
                    Today
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterOption, tempFilters.dateRange === 'week' && styles.filterOptionActive]}
                  onPress={() => setTempFilters({ ...tempFilters, dateRange: 'week' })}
                >
                  <Text style={[styles.filterOptionText, tempFilters.dateRange === 'week' && styles.filterOptionTextActive]}>
                    This Week
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterOption, tempFilters.dateRange === 'month' && styles.filterOptionActive]}
                  onPress={() => setTempFilters({ ...tempFilters, dateRange: 'month' })}
                >
                  <Text style={[styles.filterOptionText, tempFilters.dateRange === 'month' && styles.filterOptionTextActive]}>
                    This Month
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.filterActions}>
              <TouchableOpacity
                style={styles.filterResetButton}
                onPress={() => {
                  setTempFilters({ species: 'all', confidence: 'all', dateRange: 'all' });
                  setActiveFilter('all');
                  setShowFilterModal(false);
                }}
              >
                <Text style={styles.filterResetText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.filterApplyButton}
                onPress={() => {
                  // Apply filters logic here
                  setShowFilterModal(false);
                }}
              >
                <Text style={styles.filterApplyText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 70,
    paddingBottom: 16,
    backgroundColor: '#FAF8F6',
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
  pullToRefreshHint: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 12,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#0e161b',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  rightSection: {
    paddingLeft: 8,
    justifyContent: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 130,
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
  // Liquid Glass Context Menu Styles
  glassModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  glassMenuContainer: {
    width: 250,
    borderRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 25,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  glassMenu: {
    borderRadius: 14,
    overflow: 'hidden',
    paddingVertical: 8,
  },
  glassMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  glassIconWrapper: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  glassMenuText: {
    fontSize: 17,
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  deleteMenuText: {
    color: '#FF453A',
  },
  glassMenuDivider: {
    height: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 4,
    marginHorizontal: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingBottom: 34,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deleteIconContainer: {
    backgroundColor: '#FEE2E2',
  },
  actionButtonText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
  },
  deleteText: {
    color: '#EF4444',
  },
  actionDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingBottom: 34,
    paddingHorizontal: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  filterModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterOptionActive: {
    backgroundColor: '#4cb2e6',
    borderColor: '#4cb2e6',
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterOptionTextActive: {
    color: '#FFFFFF',
  },
  filterActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  filterResetButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  filterResetText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterApplyButton: {
    flex: 2,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#4cb2e6',
    borderRadius: 12,
  },
  filterApplyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
