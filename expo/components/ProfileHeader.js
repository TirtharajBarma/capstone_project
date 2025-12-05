import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfileHeader({ name, email, imageUrl, onEditPress }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl || 'https://via.placeholder.com/128' }}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
            <MaterialCommunityIcons name="pencil" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  content: {
    width: '100%',
    gap: 16,
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#E5E7EB',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#A8D0B5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    gap: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3C3C3B',
    letterSpacing: -0.33,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});
