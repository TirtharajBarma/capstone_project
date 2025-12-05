import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

export default function ScanScreen() {
  const router = useRouter();
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off');
  const [capturedImage, setCapturedImage] = useState(null);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <MaterialCommunityIcons name="camera-off" size={64} color="#9CA3AF" />
        <Text style={styles.permissionText}>Camera permission required</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });
      setCapturedImage(photo.uri);
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
    }
  };

  const retake = () => {
    setCapturedImage(null);
  };

  const analyzeImage = () => {
    // TODO: Navigate to results page with image
    console.log('Analyzing image:', capturedImage);
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

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
      >
        {/* Top Navigation */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Cattle</Text>
          <TouchableOpacity style={styles.headerButton} onPress={showHelp}>
            <MaterialCommunityIcons name="help-circle-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Camera Frame Overlay */}
        <View style={styles.frameContainer}>
          <View style={styles.frame}>
            {/* Corner Brackets */}
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />

            {/* Grid Lines */}
            <View style={styles.gridContainer}>
              <View style={[styles.gridVertical, { left: '33.33%' }]} />
              <View style={[styles.gridVertical, { left: '66.66%' }]} />
              <View style={[styles.gridHorizontal, { top: '33.33%' }]} />
              <View style={[styles.gridHorizontal, { top: '66.66%' }]} />
            </View>

            {/* In-Frame Controls */}
            <View style={styles.inFrameControls}>
              <TouchableOpacity style={styles.inFrameButton} onPress={toggleFlash}>
                <MaterialCommunityIcons
                  name={flash === 'off' ? 'flash-off' : 'flash'}
                  size={20}
                  color="#FFF"
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.inFrameButton} onPress={toggleCameraFacing}>
                <MaterialCommunityIcons name="camera-flip" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Instruction Text */}
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              Align the animal's head within the frame
            </Text>
          </View>
        </View>
      </CameraView>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <View style={styles.pullIndicator} />
        
        <View style={styles.controlsRow}>
          {/* Library Button */}
          <TouchableOpacity style={styles.controlButton} onPress={pickImage}>
            <View style={styles.iconButton}>
              <MaterialCommunityIcons name="image-multiple" size={24} color="#A6C1EE" />
            </View>
            <Text style={styles.controlLabel}>Library</Text>
          </TouchableOpacity>

          {/* Shutter Button */}
          <TouchableOpacity style={styles.shutterContainer} onPress={takePicture}>
            <View style={styles.shutterOuter}>
              <View style={styles.shutterInner}>
                <MaterialCommunityIcons name="camera" size={32} color="#FFF" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Recent Button */}
          <TouchableOpacity style={styles.controlButton} onPress={() => router.push('/history')}>
            <View style={styles.iconButton}>
              <MaterialCommunityIcons name="history" size={24} color="#A6C1EE" />
            </View>
            <Text style={styles.controlLabel}>Recent</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Captured Image Confirmation Card */}
      {capturedImage && (
        <View style={styles.confirmationCard}>
          <TouchableOpacity style={styles.closeButton} onPress={retake}>
            <MaterialCommunityIcons name="close" size={16} color="#6B7280" />
          </TouchableOpacity>

          <Image source={{ uri: capturedImage }} style={styles.previewImage} />

          <View style={styles.confirmationContent}>
            <View style={styles.confirmationHeader}>
              <Text style={styles.confirmationTitle}>Image Captured</Text>
              <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
            </View>

            <View style={styles.confirmationActions}>
              <TouchableOpacity style={styles.retakeButton} onPress={retake}>
                <Text style={styles.retakeButtonText}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.analyzeButton} onPress={analyzeImage}>
                <Text style={styles.analyzeButtonText}>Analyze</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 24,
    fontWeight: '600',
  },
  permissionButton: {
    backgroundColor: '#664ce6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
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
    letterSpacing: 0.5,
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
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
    justifyContent: 'center',
    gap: 32,
    paddingHorizontal: 32,
  },
  controlButton: {
    alignItems: 'center',
    gap: 6,
  },
  iconButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#664ce6',
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
    borderColor: '#E8E4FF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#664ce6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#664ce6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  recentButton: {
    padding: 0,
    overflow: 'hidden',
  },
  recentImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  confirmationCard: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    left: 16,
    right: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  closeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  confirmationContent: {
    flex: 1,
    gap: 8,
  },
  confirmationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  confirmationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  retakeButton: {
    flex: 1,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  retakeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  analyzeButton: {
    flex: 1,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#664ce6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#664ce6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  analyzeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
});
