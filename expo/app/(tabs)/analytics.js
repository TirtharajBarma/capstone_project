import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserContext } from '../../context/UserContext';
import { userAPI } from '../../api/client';
import { Svg, Circle, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function Analytics() {
  const router = useRouter();
  const { clerkUser } = useUserContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchAnalytics = async (selectedFilter = filter) => {
    try {
      const response = await userAPI.getAnalytics(clerkUser?.id, selectedFilter);
      setData(response.data);
    } catch (error) {
      console.warn('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    fetchAnalytics(newFilter);
  };

  useEffect(() => {
    if (clerkUser?.id) {
      fetchAnalytics();
    }
  }, [clerkUser?.id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  const renderDonutChart = () => {
    if (!data?.breedBreakdown || data.breedBreakdown.length === 0) {
      return null;
    }

    const size = 200;
    const strokeWidth = 35;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const centerX = size / 2;
    const centerY = size / 2;

    // Top 3 breeds + Other
    const colors = ['#FFAACF', '#B3E2A7', '#A6C1EE', '#EBE9F2'];
    const top3 = data.breedBreakdown.slice(0, 3);
    const otherPercentage = data.breedBreakdown.slice(3).reduce((sum, item) => sum + item.percentage, 0);
    
    const chartData = [...top3];
    if (otherPercentage > 0) {
      chartData.push({ breed: 'Other', percentage: otherPercentage });
    }

    let currentAngle = -90;

    return (
      <View style={styles.chartContainer}>
        <Svg width={size} height={size}>
          {chartData.map((item, index) => {
            const percentage = item.percentage;
            const angle = (percentage / 100) * 360;
            const strokeDashoffset = circumference - (percentage / 100) * circumference;

            const component = (
              <Circle
                key={index}
                cx={centerX}
                cy={centerY}
                r={radius}
                stroke={colors[index]}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                rotation={currentAngle}
                origin={centerX + ',' + centerY}
                strokeLinecap="round"
              />
            );

            currentAngle += angle;
            return component;
          })}
          <SvgText
            x={centerX}
            y={centerY + 4}
            textAnchor="middle"
            fontSize="36"
            fontWeight="bold"
            fill="#1F2937"
          >
            {data.totalAnalyses}
          </SvgText>
          <SvgText
            x={centerX}
            y={centerY + 25}
            textAnchor="middle"
            fontSize="14"
            fill="#6B7280"
          >
            Animals
          </SvgText>
        </Svg>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterOuterContainer}>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => handleFilterChange('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'cow' && styles.filterTabActive]}
            onPress={() => handleFilterChange('cow')}
          >
            <Text style={[styles.filterText, filter === 'cow' && styles.filterTextActive]}>
              Cows
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'buffalo' && styles.filterTabActive]}
            onPress={() => handleFilterChange('buffalo')}
          >
            <Text style={[styles.filterText, filter === 'buffalo' && styles.filterTextActive]}>
              Buffaloes
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#8B5CF6"
            title="Pull to refresh"
            titleColor="#9CA3AF"
          />
        }
      >
        {/* Pull to Refresh Hint */}
        <Text style={styles.pullToRefreshHint}>↓ Pull down to refresh</Text>
        


      {/* Swipe Indicator */}
      <Text style={styles.swipeIndicator}>← Swipe to see all stats →</Text>

      {/* Stats Cards - Horizontal Scroll */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.statsScrollView}
        contentContainerStyle={styles.statsRow}
      >
        <View style={styles.statCard}>
          <View style={[styles.iconCircle, { backgroundColor: '#EDE9FE' }]}>
            <MaterialCommunityIcons name="upload" size={24} color="#8B5CF6" />
          </View>
          <Text style={styles.statLabel}>Total Submissions</Text>
          <Text style={styles.statValue}>{data?.totalAnalyses?.toLocaleString() || 0}</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.iconCircle, { backgroundColor: '#EDE9FE' }]}>
            <MaterialCommunityIcons name="check-decagram" size={24} color="#8B5CF6" />
          </View>
          <Text style={styles.statLabel}>Overall Accuracy</Text>
          <Text style={styles.statValue}>{data?.accuracyRate || 0}%</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.iconCircle, { backgroundColor: '#EDE9FE' }]}>
            <MaterialCommunityIcons name="format-list-bulleted" size={24} color="#8B5CF6" />
          </View>
          <Text style={styles.statLabel}>Unique Breeds</Text>
          <Text style={styles.statValue}>{data?.uniqueBreeds || 0}</Text>
        </View>
      </ScrollView>

      {(!data?.totalAnalyses || data.totalAnalyses === 0) ? (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyIconContainer}>
            <MaterialCommunityIcons name="chart-box-outline" size={64} color="#C4B5FD" />
          </View>
          <Text style={styles.emptyStateTitle}>No stats available yet</Text>
          <Text style={styles.emptyStateSubtitle}>
            Scan your cattle to see detailed analytics and insights breakdown.
          </Text>
          <TouchableOpacity 
            style={styles.startScanningButton}
            onPress={() => router.push('/scan')}
          >
            <MaterialCommunityIcons name="camera-plus" size={20} color="#FFFFFF" />
            <Text style={styles.startScanningText}>Start Scanning</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Breed Breakdown Chart */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Breed Breakdown</Text>
            {renderDonutChart()}
            <View style={styles.legendContainer}>
              {data?.breedBreakdown?.slice(0, 3).map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      {
                        backgroundColor: ['#FFAACF', '#B3E2A7', '#A6C1EE'][index],
                      },
                    ]}
                  />
                  <Text style={styles.legendLabel}>{item.breed}</Text>
                  <Text style={styles.legendValue}>{item.percentage}%</Text>
                </View>
              ))}
              {data?.breedBreakdown && data.breedBreakdown.length > 3 && (
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#EBE9F2' }]} />
                  <Text style={styles.legendLabel}>Other</Text>
                  <Text style={styles.legendValue}>
                    {data.breedBreakdown.slice(3).reduce((sum, item) => sum + item.percentage, 0)}%
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Top 5 Breeds */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Top 5 Breeds</Text>
            {data?.topBreeds?.map((item, index) => (
              <View key={index} style={styles.topBreedItem}>
                <Text style={styles.topBreedName}>{item.breed}</Text>
                <View style={styles.topBreedBar}>
                  <View
                    style={[
                      styles.topBreedBarFill,
                      {
                        width: `${item.percentage}%`,
                        backgroundColor: '#FFC09F',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.topBreedCount}>{item.count}</Text>
              </View>
            ))}
          </View>

          {/* Recent Submissions */}
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>5 Latest Recent Submissions</Text>
            {data?.recentRecognitions?.slice(0, 5).map((item, index) => (
              <TouchableOpacity 
                key={item.id || index} 
                style={styles.recentItem}
                activeOpacity={0.8}
                onPress={() => {
                  // Navigate to results page with complete prediction data
                  router.push({
                    pathname: '/results',
                    params: {
                      prediction: JSON.stringify({
                        breed: item.breed,
                        species: item.species,
                        confidence: item.confidence / 100, // Convert back to 0-1 range
                        topPredictions: item.topPredictions, // Use backend data directly with complete breedInfo
                        inferenceTime: item.inferenceTime,
                        isFavorite: item.isFavorite || false,
                      }),
                      imageUrl: item.imageUrl || item.breedImage,
                      predictionId: item.id,
                      source: 'analytics', // Track source page for back navigation
                    },
                  });
                }}
              >
                <Image
                  source={{ uri: item.imageUrl || item.breedImage }}
                  style={styles.recentImage}
                />
                <View style={styles.recentInfo}>
                  <Text style={styles.recentBreed}>{item.breed}</Text>
                  <Text style={styles.recentTime}>
                    {new Date(item.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                    {', '}
                    {new Date(item.timestamp).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <View style={styles.recentConfidence}>
                  <Text style={styles.confidenceValue}>{item.confidence}%</Text>
                  <Text style={styles.confidenceLabel}>Confidence</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3FF',
  },
  header: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 16,
    paddingTop: 90,
    paddingBottom: 15,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 120,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  pullToRefreshHint: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 12,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  swipeIndicator: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  filterOuterContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 6,
  },
  filterTab: {
    paddingHorizontal: 36,
    paddingVertical: 12,
    borderRadius: 26,
    backgroundColor: 'transparent',
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabActive: {
    backgroundColor: '#8B5CF6',
  },
  filterText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  statsScrollView: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 16,
  },
  statCard: {
    width: (width - 48) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  legendContainer: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  legendValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  topBreedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  topBreedName: {
    width: 100,
    fontSize: 14,
    color: '#1F2937',
  },
  topBreedBar: {
    flex: 1,
    height: 24,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    overflow: 'hidden',
  },
  topBreedBarFill: {
    height: '100%',
    borderRadius: 12,
  },
  topBreedCount: {
    width: 40,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  recentSection: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 16,
    paddingTop: 0,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  recentImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  recentInfo: {
    flex: 1,
  },
  recentBreed: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  recentTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  recentConfidence: {
    alignItems: 'flex-end',
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 2,
  },
  confidenceLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  startScanningButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startScanningText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
