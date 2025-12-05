import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Linking,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Mock FAQ Data
const FAQ_ITEMS = [
  {
    category: 'Scanning',
    question: "How to take a clear photo?",
    answer: "Ensure good lighting and hold your camera steady. Keep the cow's face or full body in the center of the frame. Avoid blurry or extremely close-up shots for best results."
  },
  {
    category: 'Breeds',
    question: "Which breeds are supported?",
    answer: "We currently support identification for over 20 major cow and buffalo breeds including Jersey, Holstein, Murrah, and Sahiwal.",
    isOpen: true 
  },
  {
    category: 'Scanning',
    question: "Why is scanning slow?",
    answer: "Scanning speed depends on your internet connection and image size. Try using a stable Wi-Fi connection or resizing very large images."
  },
  {
    category: 'General',
    question: "How do I reset my password?",
    answer: "Go to the login screen and tap 'Forgot Password'. Follow the instructions sent to your email to reset your credentials."
  }
];

const FilterChip = ({ label, active, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <View style={[styles.filterChip, active && styles.filterChipActive]}>
      {label === 'General' && (
        <MaterialCommunityIcons name="information" size={16} color={active ? '#FFFFFF' : '#3B82F6'} style={{ marginRight: 4 }} />
      )}
      {label === 'Scanning' && (
        <MaterialCommunityIcons name="scan-helper" size={16} color={active ? '#FFFFFF' : '#22C55E'} style={{ marginRight: 4 }} />
      )}
      {label === 'Breeds' && (
        <MaterialCommunityIcons name="paw" size={16} color={active ? '#FFFFFF' : '#A855F7'} style={{ marginRight: 4 }} />
      )}

      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
    </View>
  </TouchableOpacity>
);

const AccordionItem = ({ item }) => {
  const [isOpen, setIsOpen] = useState(item.isOpen || false);

  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity 
        style={styles.accordionHeader} 
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}
      >
        <Text style={[styles.accordionTitle, isOpen && styles.accordionTitleActive]}>
          {item.question}
        </Text>
        <MaterialCommunityIcons 
          name={isOpen ? "chevron-up" : "chevron-down"} 
          size={24} 
          color={isOpen ? "#47b4eb" : "#6B7280"} 
        />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.accordionContent}>
          <Text style={styles.accordionText}>{item.answer}</Text>
        </View>
      )}
    </View>
  );
};

export default function HelpSupportScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null); // null means all
  const [isBugModalVisible, setIsBugModalVisible] = useState(false);
  const [bugDescription, setBugDescription] = useState('');

  const filteredFAQs = FAQ_ITEMS.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const handleEmail = () => {
    Linking.openURL('mailto:tirtharajbarma3@gmail.com');
  };

  const handleSubmitBug = () => {
    // Logic to be implemented later
    console.log('Submitting bug:', bugDescription);
    setBugDescription('');
    setIsBugModalVisible(false);
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
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.mainTitle}>How can we{'\n'}help you?</Text>
        <Text style={styles.subTitle}>
          Search for answers or browse topics below to identify your cattle.
        </Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#47b4eb" />
          <TextInput
            style={styles.searchInput}
            placeholder="Try 'scanning tips' or 'breeds'..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Chips */}
        <View style={styles.chipsContainer}>
          <FilterChip 
            label="General" 
            active={selectedCategory === 'General'} 
            onPress={() => setSelectedCategory(selectedCategory === 'General' ? null : 'General')} 
          />
          <FilterChip 
            label="Scanning" 
            active={selectedCategory === 'Scanning'} 
            onPress={() => setSelectedCategory(selectedCategory === 'Scanning' ? null : 'Scanning')} 
          />
          <FilterChip 
            label="Breeds" 
            active={selectedCategory === 'Breeds'} 
            onPress={() => setSelectedCategory(selectedCategory === 'Breeds' ? null : 'Breeds')} 
          />
        </View>

        <Text style={styles.sectionHeader}>Frequently Asked Questions</Text>

        {/* FAQ Accordion */}
        <View style={styles.faqList}>
          {filteredFAQs.map((item, index) => (
            <AccordionItem key={index} item={item} />
          ))}
          {filteredFAQs.length === 0 && (
            <Text style={styles.noResultsText}>No results found.</Text>
          )}
        </View>

        <Text style={styles.sectionHeader}>Still need help?</Text>

        {/* Contact Cards Row */}
        <View style={styles.contactRow}>
          <TouchableOpacity style={styles.contactCard} onPress={handleEmail}>
            <View style={styles.contactIconCircle}>
              <MaterialCommunityIcons name="email" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.contactTitle}>Email Us</Text>
            <Text style={styles.contactSubtitle}>Get a reply in 24h</Text>
          </TouchableOpacity>
        </View>

        {/* Report Bug */}
        <TouchableOpacity style={styles.bugReportCard} onPress={() => setIsBugModalVisible(true)}>
          <View style={styles.bugIconCircle}>
            <MaterialCommunityIcons name="bug" size={20} color="#374151" />
          </View>
          <View style={styles.bugContent}>
            <Text style={styles.bugTitle}>Report a Bug</Text>
            <Text style={styles.bugSubtitle}>Help us improve the app</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>VERSION 2.4.0</Text>
          <View style={styles.legalLinks}>
             <TouchableOpacity onPress={() => router.push('/privacy-policy')}>
               <Text style={styles.legalLinkText}>Privacy Policy</Text>
             </TouchableOpacity>
             <Text style={styles.legalLinkSeparator}>•</Text>
              <TouchableOpacity>
               <Text style={styles.legalLinkText}>Terms of Service</Text>
             </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* Bug Report Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isBugModalVisible}
        onRequestClose={() => setIsBugModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Report a Bug</Text>
                <TouchableOpacity onPress={() => setIsBugModalVisible(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.modalSubtitle}>
                Describe the issue you encountered. We appreciate your feedback!
              </Text>
              
              <TextInput
                style={styles.bugInput}
                multiline
                numberOfLines={4}
                placeholder="Describe the bug here..."
                placeholderTextColor="#9CA3AF"
                value={bugDescription}
                onChangeText={setBugDescription}
                textAlignVertical="top"
              />

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmitBug}>
                <Text style={styles.submitButtonText}>Submit Report</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF8F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAF8F6',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111518',
    marginTop: 12,
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#EBF5FF',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: '#47b4eb',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111518',
    marginBottom: 16,
  },
  faqList: {
    gap: 12,
    marginBottom: 32,
  },
  noResultsText: {
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  accordionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
    paddingRight: 16,
  },
  accordionTitleActive: {
    color: '#47b4eb',
  },
  accordionContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  accordionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  contactCard: {
    flex: 1,
    backgroundColor: '#F0F9FF', // Light blue bg for Email
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111518',
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  bugReportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  bugIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  bugContent: {
    flex: 1,
  },
  bugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111518',
  },
  bugSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  versionText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#D1D5DB', // Light gray
    marginBottom: 8,
    letterSpacing: 1,
  },
  legalLinks: {
    flexDirection: 'row',
    gap: 8,
  },
  legalLinkText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  legalLinkSeparator: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111518',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  bugInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#374151',
    minHeight: 120,
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: '#47b4eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#47b4eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
