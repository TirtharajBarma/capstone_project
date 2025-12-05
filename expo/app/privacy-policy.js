import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Linking
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  const handleContact = () => {
    // Open email client
    Linking.openURL('mailto:tirtharajbarma3@gmail.com');
  };

  const handleReadTerms = () => {
    // Navigate to terms or open URL
    console.log('Read full terms');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroImageContainer}>
            <View style={styles.heroImageGlow} />
            <Image
              source={{ uri: 'https://img.freepik.com/free-vector/gradient-technological-background_23-2148884155.jpg' }}
              style={styles.heroImage}
            />
            <View style={styles.shieldBadge}>
              <MaterialIcons name="security" size={16} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.heroTitle}>Your Data & Privacy</Text>
          <Text style={styles.heroSubtitle}>Transparency is our priority.</Text>
        </View>

        <Text style={styles.lastUpdated}>LAST UPDATED: OCTOBER 24, 2023</Text>

        {/* Intro Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="verified-user" size={24} color="#47b4eb" />
            <Text style={styles.cardTitle}>Protecting your herd</Text>
          </View>
          <Text style={styles.cardText}>
            We are committed to protecting your personal information and your right to privacy. This policy explains how we handle the cattle images you upload for breed identification.
          </Text>
        </View>

        {/* Information Collection */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionRow}>
            <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
              <MaterialIcons name="photo-camera" size={24} color="#3B82F6" />
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionTitle}>Information We Collect</Text>
              <Text style={styles.sectionText}>
                We collect images you upload or capture via the camera specifically for identifying cow and buffalo breeds.
              </Text>
              <View style={styles.bulletList}>
                <View style={styles.bulletItem}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>Photos from your gallery</Text>
                </View>
                <View style={styles.bulletItem}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>Live camera feed data</Text>
                </View>
                <View style={styles.bulletItem}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>Device metadata (e.g., model) for optimization</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* How We Use Information */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionRow}>
            <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
              <MaterialIcons name="psychology" size={24} color="#22C55E" />
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionTitle}>How We Use Information</Text>
              <Text style={styles.sectionText}>
                Our AI analyzes the visual features of the livestock in your photos to provide accurate breed identification. These images are processed to improve our recognition algorithms.
              </Text>
            </View>
          </View>
        </View>

        {/* Sharing Information */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionRow}>
            <View style={[styles.iconBox, { backgroundColor: '#FAF5FF' }]}>
              <MaterialIcons name="share" size={24} color="#A855F7" />
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionTitle}>Sharing Information</Text>
              <Text style={styles.sectionText}>
                We do not sell your personal photos. Aggregated, anonymized data may be used for research to improve global cattle health monitoring systems.
              </Text>
            </View>
          </View>
        </View>

        {/* Your Rights */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionRow}>
            <View style={[styles.iconBox, { backgroundColor: '#FFF7ED' }]}>
              <MaterialIcons name="gavel" size={24} color="#F97316" />
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionTitle}>Your Rights</Text>
              <Text style={styles.sectionText}>
                You retain ownership of your photos. You can request the deletion of your data from our servers at any time.
              </Text>

            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>Have questions?</Text>
          <Text style={styles.footerText}>
            If you have any concerns about your privacy or data usage, please reach out to our team.
          </Text>
          <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
            <MaterialIcons name="mail" size={20} color="#FFFFFF" />
            <Text style={styles.contactButtonText}>Contact Privacy Team</Text>
          </TouchableOpacity>
        </View>
        
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F7F8', // background-light
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(246, 247, 248, 0.9)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    // hover effect not directly applicable in RN without Pressable state, keeping simple
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111518',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: 'rgba(71, 180, 235, 0.05)', // primary/5
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(71, 180, 235, 0.1)',
  },
  heroImageContainer: {
    position: 'relative',
    marginBottom: 16,
    width: 100,
    height: 100,
  },
  heroImageGlow: {
    position: 'absolute',
    inset: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    opacity: 0.6,
    transform: [{ scale: 1.1 }],
  },
  heroImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  shieldBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#47b4eb', // primary
    padding: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111518',
    marginBottom: 4,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#637c88',
    textAlign: 'center',
  },
  lastUpdated: {
    fontSize: 10,
    color: '#637c88',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111518',
  },
  cardText: {
    fontSize: 14,
    color: '#111518',
    lineHeight: 22,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  sectionRow: {
    flexDirection: 'row',
    gap: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111518',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 13,
    color: '#4B5563', // gray-600
    lineHeight: 20,
    marginBottom: 8,
  },
  bulletList: {
    marginTop: 4,
    gap: 6,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6B7280', // gray-500
  },
  bulletText: {
    fontSize: 13,
    color: '#6B7280',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  linkText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#47b4eb',
  },
  footerCard: {
    backgroundColor: 'rgba(71, 180, 235, 0.05)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(71, 180, 235, 0.1)',
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111518',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  contactButton: {
    backgroundColor: '#47b4eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    width: '100%',
    shadowColor: '#47b4eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
