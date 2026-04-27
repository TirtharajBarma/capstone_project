import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { predictionAPI } from '../../api/client';

const { width, height } = Dimensions.get('window');

export default function ScanScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off');
  const [capturedImage, setCapturedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [selectedSource, setSelectedSource] = useState(params.source === 'upload' ? 'upload' : 'camera');

  useEffect(() => {
    if (params.imageUri) {
      setCapturedImage(params.imageUri);
      setSelectedSource(params.source === 'upload' ? 'upload' : 'camera');
    }
  }, [params.imageUri, params.source]);

  // Only activate camera when screen is focused (and only if no pre-loaded image)
  useFocusEffect(
    React.useCallback(() => {
      if (!params.imageUri && !capturedImage) {
        setIsCameraActive(true);
      }
      
      return () => {
        setIsCameraActive(false);
      };
    }, [params.imageUri, capturedImage])
  );

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: false,
        exif: false,
      });
      setCapturedImage(photo.uri);
      setSelectedSource('camera');
      setIsCameraActive(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [3, 4],
    });

    if (!result.canceled) {
      setCapturedImage(result.assets[0].uri);
      setSelectedSource('upload');
      setIsCameraActive(false);
    }
  };

  const retake = () => {
    if (selectedSource === 'upload') {
      pickImage();
      return;
    }
    setCapturedImage(null);
    setIsCameraActive(true);
  };

  const analyzeImage = async () => {
    console.log('🚀 [ANALYZE] Function called!');
    
    if (!capturedImage) {
      console.log('❌ [ANALYZE] No captured image');
      Alert.alert('Error', 'No image to analyze');
      return;
    }
    
    if (isAnalyzing) {
      console.log('⏳ [ANALYZE] Already analyzing...');
      return;
    }
    
    console.log('🔍 [ANALYZE] Starting analysis...');
    console.log('📸 [ANALYZE] Image URI:', capturedImage);
    
    setIsAnalyzing(true);
    
    try {
      console.log('📤 [ANALYZE] Preparing FormData...');
      
      // Create FormData
      const formData = new FormData();
      formData.append('image', {
        uri: capturedImage,
        type: 'image/jpeg',
        name: 'cattle-image.jpg',
      });
      
      console.log('🌐 [ANALYZE] Calling prediction API...');
      
      // Call prediction API
      const result = await predictionAPI.predict(formData);
      
      console.log('✅ [ANALYZE] API Response:', result);
      
      if (result.success) {
        const predictionData = result.data;
        
        console.log('📊 [ANALYZE] Prediction data:', predictionData);
        
        // Navigate to results page with real prediction data from backend
        // Backend returns: breed, species, confidence, topPredictions, inferenceTime
        router.push({
          pathname: '/results',
          params: {
            prediction: JSON.stringify({
              breed: predictionData.breed, // Backend uses "breed" not "predictedBreed"
              species: predictionData.species,
              confidence: predictionData.confidence,
              topPredictions: predictionData.topPredictions, // Already includes breedInfo
              inferenceTime: predictionData.inferenceTime,
            }),
            imageUrl: capturedImage,
            source: 'scan', // Track source page for back navigation
          },
        });
        
        console.log('🎯 [ANALYZE] Navigating to results page');
      } else {
        console.log('❌ [ANALYZE] API returned error:', result.message);
        Alert.alert('Error', result.message || 'Failed to analyze image');
      }
    } catch (error) {
      console.warn('💥 [ANALYZE] Error:', error);
      console.warn('💥 [ANALYZE] Error details:', error.message);
      console.warn('💥 [ANALYZE] Error stack:', error.stack);
      Alert.alert(
        'Analysis Failed',
        'Could not analyze the image. Please try again or check your connection.'
      );
    } finally {
      setIsAnalyzing(false);
      console.log('🏁 [ANALYZE] Analysis complete');
    }
  };

  const toggleFlash = () => {
    setFlash(current => (current === 'off' ? 'on' : 'off'));
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const showHelp = () => {
    Alert.alert(
      'How to Scan',
      '1. Position the cattle within the frame\n2. Ensure good lighting\n3. Focus on the animal\'s head and body\n4. Tap the camera button to capture\n5. Review and analyze the image',
      [{ text: 'Got it', style: 'default' }]
    );
  };

  const header = (
    <View style={[styles.header, { paddingTop: Math.max(insets.top + 10, Platform.OS === 'ios' ? 60 : 40) }]}>
      <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
        <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{capturedImage ? 'Review Image' : 'Scan Cattle'}</Text>
      <TouchableOpacity style={styles.headerButton} onPress={showHelp}>
        <MaterialCommunityIcons name="help-circle-outline" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );

  if (capturedImage) {
    return (
      <View style={styles.previewContainer}>
        {header}

        <View style={[styles.previewStage, { paddingTop: Math.max(insets.top + 92, 116) }]}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />
        </View>

        <View style={[styles.previewPanel, { paddingBottom: Math.max(insets.bottom + 100, 122) }]}>
          <View style={styles.previewHandle} />
          <View style={styles.previewCopy}>
            <View style={styles.previewIcon}>
              <MaterialCommunityIcons name="check" size={18} color="#0F6B45" />
            </View>
            <View style={styles.previewTextBlock}>
              <Text style={styles.previewTitle}>
                {selectedSource === 'upload' ? 'Image selected' : 'Photo captured'}
              </Text>
              <Text style={styles.previewSubtitle}>
                Review the frame, then analyze the breed prediction.
              </Text>
            </View>
          </View>

          <View style={styles.confirmationActions}>
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={retake}
              disabled={isAnalyzing}
            >
              <MaterialCommunityIcons
                name={selectedSource === 'upload' ? 'image-search-outline' : 'camera-retake-outline'}
                size={18}
                color="#395145"
              />
              <Text style={styles.retakeButtonText}>
                {selectedSource === 'upload' ? 'Choose again' : 'Retake'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
              onPress={analyzeImage}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <ActivityIndicator size="small" color="#FFF" />
                  <Text style={styles.analyzeButtonText}>Analyzing</Text>
                </>
              ) : (
                <>
                  <MaterialCommunityIcons name="sparkles" size={18} color="#FFF" />
                  <Text style={styles.analyzeButtonText}>Analyze</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <MaterialCommunityIcons name="camera-off" size={64} color="#9CA3AF" />
        <Text style={styles.permissionText}>Camera permission required</Text>
        <Text style={styles.permissionSubtext}>
          Enable camera access to take a new scan, or choose a photo from your library.
        </Text>
        <View style={styles.permissionActions}>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.permissionSecondaryButton} onPress={pickImage}>
            <Text style={styles.permissionSecondaryButtonText}>Open Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isCameraActive && (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          flash={flash}
        >
          {header}

          <View style={styles.frameContainer}>
            <View style={styles.frame}>
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />

              <View style={styles.gridContainer}>
                <View style={[styles.gridVertical, { left: '33.33%' }]} />
                <View style={[styles.gridVertical, { left: '66.66%' }]} />
                <View style={[styles.gridHorizontal, { top: '33.33%' }]} />
                <View style={[styles.gridHorizontal, { top: '66.66%' }]} />
              </View>

              <View style={styles.inFrameControls}>
                <TouchableOpacity style={styles.inFrameButton} onPress={toggleFlash}>
                  <MaterialCommunityIcons
                    name={flash === 'off' ? 'flash-off' : 'flash'}
                    size={20}
                    color="#FFF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>
                Align the animal's head within the frame
              </Text>
            </View>
          </View>
        </CameraView>
      )}

      <View style={[styles.bottomControls, { paddingBottom: Math.max(insets.bottom + 92, 112) }]}>
        <View style={styles.pullIndicator} />
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.controlButton} onPress={pickImage}>
            <View style={styles.iconButton}>
              <MaterialCommunityIcons name="image-multiple" size={24} color="#2F6B4F" />
            </View>
            <Text style={styles.controlLabel}>Library</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shutterContainer} onPress={takePicture}>
            <View style={styles.shutterOuter}>
              <View style={styles.shutterInner}>
                <MaterialCommunityIcons name="camera" size={32} color="#FFF" />
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
            <View style={styles.iconButton}>
              <MaterialCommunityIcons name="camera-flip" size={24} color="#2F6B4F" />
            </View>
            <Text style={styles.controlLabel}>Reverse</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050705',
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF8F6',
    padding: 24,
  },
  permissionText: {
    fontSize: 18,
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  permissionSubtext: {
    maxWidth: 300,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
    marginBottom: 24,
  },
  permissionActions: {
    width: '100%',
    gap: 10,
  },
  permissionButton: {
    backgroundColor: '#216B4B',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  permissionSecondaryButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE5DE',
  },
  permissionSecondaryButtonText: {
    color: '#216B4B',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.48)',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    letterSpacing: 0,
  },
  frameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  frame: {
    width: width * 0.85,
    aspectRatio: 3 / 4,
    maxHeight: height * 0.7,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 24,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#FFF',
  },
  cornerTopLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  cornerTopRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  cornerBottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  cornerBottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridVertical: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  gridHorizontal: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  inFrameControls: {
    position: 'absolute',
    top: 16,
    right: 16,
    gap: 12,
  },
  inFrameButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionContainer: {
    position: 'absolute',
    bottom: -60,
    paddingHorizontal: 32,
  },
  instructionText: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    textAlign: 'center',
    overflow: 'hidden',
  },
  bottomControls: {
    backgroundColor: '#FAF8F6',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  pullIndicator: {
    width: 48,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    marginBottom: 16,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 320,
    paddingHorizontal: 20,
  },
  controlButton: {
    alignItems: 'center',
    gap: 6,
  },
  iconButton: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#102016',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  controlLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
    letterSpacing: 0.3,
  },
  shutterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#D8EFE2',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#216B4B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#216B4B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#07100B',
  },
  previewStage: {
    flex: 1,
    paddingHorizontal: 18,
    paddingBottom: 212,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#111827',
    resizeMode: 'cover',
  },
  previewPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FAF8F6',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 14,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 12,
  },
  previewHandle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D8D1',
    marginBottom: 18,
  },
  previewCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  previewIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DDF4E7',
  },
  previewTextBlock: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#17261C',
  },
  previewSubtitle: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    color: '#69766E',
  },
  confirmationActions: {
    flexDirection: 'row',
    gap: 10,
  },
  retakeButton: {
    flex: 1,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#EFF3EF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#DDE5DE',
  },
  retakeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#395145',
  },
  analyzeButton: {
    flex: 1,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#216B4B',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#216B4B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  analyzeButtonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});
