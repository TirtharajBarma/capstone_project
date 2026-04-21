import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  Share,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { predictionAPI } from '../api/client';
import { useUserContext } from '../context/UserContext';

const { width } = Dimensions.get('window');

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { clerkUser } = useUserContext();
  
  // Parse the prediction data from route params
  const [prediction, setPrediction] = useState(null);
  const [breedInfo, setBreedInfo] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [predictionId, setPredictionId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    console.log('📊 [RESULTS] Component mounted');
    console.log('📊 [RESULTS] Params:', params);
    
    // Check if this is a saved prediction (opened from history/analytics)
    if (params.predictionId) {
      setPredictionId(params.predictionId);
      setIsSaved(true);
    }
    
    if (params.prediction) {
      try {
        const predictionData = JSON.parse(params.prediction);
        console.log('📊 [RESULTS] Parsed prediction:', predictionData);
        setPrediction(predictionData);
        setImageUrl(params.imageUrl || predictionData.imageUrl);
        
        // Set favorite status if it exists in the prediction data
        if (predictionData.isFavorite !== undefined) {
          setIsFavorite(predictionData.isFavorite);
        }
        
        // Use primary backend fields as source of truth.
        // Keep topPredictions[0] only as a fallback for older payloads.
        if (predictionData.breedInfo) {
          console.log('✅ [RESULTS] Using primary breedInfo from prediction:', predictionData.breedInfo);
          setBreedInfo(predictionData.breedInfo);
        } else if (predictionData.topPredictions && predictionData.topPredictions.length > 0) {
          const topPrediction = predictionData.topPredictions[0];
          console.log('📊 [RESULTS] Fallback top prediction:', topPrediction);

          if (topPrediction.breedInfo) {
            console.log('✅ [RESULTS] Using fallback breedInfo from top prediction:', topPrediction.breedInfo);
            setBreedInfo(topPrediction.breedInfo);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('❌ [RESULTS] Error parsing prediction:', error);
        setLoading(false);
      }
    } else {
      console.warn('⚠️ [RESULTS] No prediction in params');
      setLoading(false);
    }
  }, [params.prediction, params.imageUrl, params.predictionId]);

  const handleShare = async () => {
    try {
      const breedName = prediction.breed || prediction.predictedBreed || prediction.topPredictions?.[0]?.breed || '';
      const confidenceVal = prediction.confidence ?? prediction.topPredictions?.[0]?.confidence ?? 0;
      const confidencePct = confidenceVal > 1 ? Math.round(confidenceVal) : Math.round(confidenceVal * 100);
      
      await Share.share({
        message: `I just identified a ${breedName}! Confidence: ${confidencePct}%\n\nUsing Cattle Breed Recognition App`,
        title: 'Cattle Breed Recognition Result',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSaveResult = async () => {
    if (!clerkUser?.id) {
      Alert.alert('Sign In Required', 'Please sign in to save results');
      return;
    }

    if (isSaved) {
      Alert.alert('Already Saved', 'This result has already been saved');
      return;
    }

    setIsSaving(true);
    try {
      // Upload image to server if it's a local file
      let uploadedImageUrl = imageUrl;
      
      if (imageUrl && imageUrl.startsWith('file://')) {
        console.log('📤 [SAVE] Uploading local image to server...');
        
        try {
          // Create FormData with the image
          const uploadFormData = new FormData();
          uploadFormData.append('image', {
            uri: imageUrl,
            type: 'image/jpeg',
            name: `cattle-${Date.now()}.jpg`,
          });

          // Use the predictionAPI client for upload
          const uploadResponse = await predictionAPI.uploadImage(uploadFormData);
          
          if (uploadResponse.success && uploadResponse.data?.url) {
            uploadedImageUrl = uploadResponse.data.url;
            console.log('✅ [SAVE] Image uploaded successfully:', uploadedImageUrl);
          } else {
            console.warn('⚠️ [SAVE] Image upload failed, saving without image URL');
            uploadedImageUrl = null;
          }
        } catch (uploadError) {
          console.error('❌ [SAVE] Image upload error:', uploadError);
          // Continue saving without image URL
          uploadedImageUrl = null;
        }
      }
      
      const predictionData = {
        predictedBreed: prediction.breed || prediction.predictedBreed || prediction.topPredictions?.[0]?.breed,
        confidence: prediction.confidence ?? prediction.topPredictions?.[0]?.confidence,
        species: prediction.species || 'cattle',
        imageUrl: uploadedImageUrl,
        imageMetadata: {
          originalName: `cattle-${Date.now()}.jpg`,
          mimetype: 'image/jpeg',
        },
        modelMetadata: {
          inferenceTime: prediction.inferenceTime,
          topPredictions: prediction.topPredictions?.map(p => ({
            breed: p.breed,
            confidence: p.confidence
          }))
        },
        searchTimestamp: Date.now()
      };

      const result = await predictionAPI.save(predictionData, clerkUser.id);
      
      if (result.success) {
        setPredictionId(result.data.predictionId);
        setIsSaved(true);
        Alert.alert('Success', 'Result saved successfully!');
      }
    } catch (error) {
      console.error('Error saving result:', error);
      Alert.alert('Error', 'Failed to save result. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!clerkUser?.id) {
      Alert.alert('Sign In Required', 'Please sign in to add favorites');
      return;
    }

    if (!predictionId && !isSaved) {
      Alert.alert('Save First', 'Please save this result before adding to favorites');
      return;
    }

    try {
      const newFavoriteStatus = !isFavorite;
      const result = await predictionAPI.toggleFavorite(predictionId, clerkUser.id, newFavoriteStatus);
      
      if (result.success) {
        setIsFavorite(newFavoriteStatus);
      }
    } catch (error) {
      console.warn('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorite status');
      setIsFavorite(!newFavoriteStatus); // Revert on error
    }
  };

  const handleRecognizeAnother = () => {
    router.replace('/scan');
  };

  const handleViewHistory = () => {
    router.replace('/history');
  };

  const handleDelete = () => {
    if (!predictionId) return;

    Alert.alert(
      'Delete Result',
      'Are you sure you want to delete this result? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSaving(true);
              const result = await predictionAPI.delete(predictionId);
              if (result.success) {
                // Navigate back to the previous screen (history/home etc)
                router.back();
              }
            } catch (error) {
              console.error('Error deleting prediction:', error);
              Alert.alert('Error', 'Failed to delete result');
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  if (!prediction) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading results...</Text>
      </View>
    );
  }

  // Use primary prediction fields first, then fallback for older payloads.
  const handleBack = () => {
    // Navigate to specific page based on source parameter
    const source = params.source;
    
    if (source === 'analytics') {
      router.push('/(tabs)/analytics');
    } else if (source === 'history') {
      router.push('/(tabs)/history');
    } else if (source === 'home') {
      router.push('/(tabs)');
    } else if (source === 'scan') {
      router.push('/(tabs)/scan');
    } else {
      // Fallback to previous screen if no source specified
      router.back();
    }
  };

  const breedName = (prediction.breed || prediction.predictedBreed || prediction.topPredictions?.[0]?.breed || '').replace(/_/g, ' ');
  const confidence = prediction.confidence ?? prediction.topPredictions?.[0]?.confidence ?? 0;
  const confidencePercentage = confidence > 1 ? Math.round(confidence) : Math.round(confidence * 100);
  const species = prediction.species || breedInfo?.species || 'Dairy Cattle';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1C1B1F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recognition Results</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
          <MaterialCommunityIcons name="share-variant" size={24} color="#1C1B1F" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        {/* Breed Name Card with Favorite Button */}
        <View style={styles.breedCard}>
          <View style={styles.breedCardContent}>
            <View style={styles.breedTextContainer}>
              <Text style={styles.breedLabel}>Identified Breed</Text>
              <Text style={styles.breedName}>{breedName}</Text>
              <Text style={styles.breedSpecies}>{species}</Text>
            </View>
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={handleToggleFavorite}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={28} 
                color={isFavorite ? "#FF6B6B" : "#5D557D"} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confidence Score Card */}
        <View style={styles.confidenceCard}>
          <View style={styles.confidenceHeader}>
            <Text style={styles.confidenceLabel}>Confidence Score</Text>
            <Text style={styles.confidenceValue}>{confidencePercentage}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${Math.min(confidencePercentage, 100)}%` }
              ]} 
            />
          </View>
        </View>

        {/* Breed Characteristics */}
        {breedInfo?.description && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Breed Characteristics</Text>
            <Text style={styles.infoText}>{breedInfo.description}</Text>
          </View>
        )}

        {/* Geographic Origin */}
        {breedInfo?.location?.region && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Geographic Origin</Text>
            <Text style={styles.infoText}>
              {breedInfo.location.region}
              {breedInfo.location.country && `, ${breedInfo.location.country}`}
            </Text>
          </View>
        )}

        {/* Geographic Origin Map */}
        {breedInfo?.location?.lat && breedInfo?.location?.lng && (
          <View style={styles.mapCard}>
            <View style={styles.mapHeader}>
              <Text style={styles.infoTitle}>Native Region</Text>
              <Text style={styles.mapSubtitle}>
                 {breedInfo.location.region}
                 {breedInfo.location.country && `, ${breedInfo.location.country}`}
              </Text>
            </View>
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: breedInfo.location.lat,
                  longitude: breedInfo.location.lng,
                  latitudeDelta: 10.0,
                  longitudeDelta: 10.0,
                }}
                scrollEnabled={true}
                zoomEnabled={true}
                rotateEnabled={true}
                pitchEnabled={true}
              >
                <Marker
                  coordinate={{
                    latitude: breedInfo.location.lat,
                    longitude: breedInfo.location.lng,
                  }}
                  title={breedName}
                  description={breedInfo.location.region} 
                />
              </MapView>
            </View>
          </View>
        )}

        {/* Physical Traits */}
        {breedInfo?.characteristics && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Physical Traits</Text>
            <View style={styles.traitsList}>
              {breedInfo.characteristics.color && breedInfo.characteristics.color.length > 0 && (
                <View style={styles.traitItem}>
                  <Text style={styles.traitLabel}>Color:</Text>
                  <Text style={styles.traitValue}>{breedInfo.characteristics.color.join(', ')}</Text>
                </View>
              )}
              {breedInfo.characteristics.size && (
                <View style={styles.traitItem}>
                  <Text style={styles.traitLabel}>Size:</Text>
                  <Text style={styles.traitValue}>{breedInfo.characteristics.size}</Text>
                </View>
              )}
              {breedInfo.characteristics.horns && (
                <View style={styles.traitItem}>
                  <Text style={styles.traitLabel}>Horns:</Text>
                  <Text style={styles.traitValue}>{breedInfo.characteristics.horns}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Key Traits Tags */}
        {breedInfo?.traits && breedInfo.traits.length > 0 && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Key Characteristics</Text>
            <View style={styles.tagsContainer}>
              {breedInfo.traits.map((trait, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{trait}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions - Fixed at bottom */}
      <View style={styles.bottomActions}>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.primaryButton, isSaving && styles.buttonDisabled]} 
            onPress={handleSaveResult}
            activeOpacity={0.8}
            disabled={isSaving || isSaved}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <MaterialCommunityIcons 
                  name={isSaved ? "bookmark-check" : "bookmark-outline"} 
                  size={22} 
                  color="#FFF" 
                />
                <Text style={styles.primaryButtonText}>
                  {isSaved ? 'Saved' : 'Save'}
                </Text>
              </>
            )}
          </TouchableOpacity>
          

          
          {(params.source === 'history' || params.source === 'analytics' || params.source === 'home') ? (
            <TouchableOpacity 
              style={[styles.cameraButton, { backgroundColor: '#FEE2E2' }]} 
              onPress={handleDelete}
              activeOpacity={0.8}
              disabled={isSaving}
            >
              <MaterialCommunityIcons name="trash-can-outline" size={22} color="#EF4444" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.cameraButton} 
              onPress={handleRecognizeAnother}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="camera" size={22} color="#5D557D" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F7FF',
  },
  loadingText: {
    fontSize: 16,
    color: '#49454F',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 12,
    backgroundColor: '#F4F7FF',
  },
  headerButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1B1F',
  },
  scrollView: {
    flex: 1,
    paddingBottom: 100, // Space for fixed buttons
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 3 / 2,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  breedCard: {
    backgroundColor: 'rgba(230, 224, 255, 0.5)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  breedCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  breedTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  favoriteButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  breedLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#49454F',
    marginBottom: 4,
  },
  breedName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#5D557D',
    marginBottom: 4,
    letterSpacing: -0.5,
    flexShrink: 1,
  },
  breedSpecies: {
    fontSize: 16,
    color: 'rgba(93, 85, 125, 0.7)',
  },
  mapCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mapHeader: {
    marginBottom: 12,
  },
  mapSubtitle: {
    fontSize: 14,
    color: '#49454F',
    marginTop: -4,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E6E0FF', // Fallback color
  },
  map: {
    width: '100%',
    height: '100%',
  },
  confidenceCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  confidenceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#49454F',
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5D557D',
  },
  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: '#E6E0FF',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5D557D',
    borderRadius: 999,
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1B1F',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#49454F',
    lineHeight: 21,
  },
  traitsList: {
    gap: 8,
  },
  traitItem: {
    flexDirection: 'row',
    gap: 8,
  },
  traitLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1B1F',
  },
  traitValue: {
    fontSize: 14,
    color: '#49454F',
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(93, 85, 125, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#5D557D',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    backgroundColor: '#F4F7FF',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5D557D',
    height: 56,
    borderRadius: 999,
    gap: 10,
    shadowColor: 'rgba(93, 85, 125, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  cameraButton: {
    width: 56,
    height: 56,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(230, 224, 255, 0.8)',
    borderRadius: 999,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(230, 224, 255, 0.8)',
    height: 56,
    borderRadius: 999,
    gap: 10,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D557D',
    letterSpacing: 0.5,
  },
});
