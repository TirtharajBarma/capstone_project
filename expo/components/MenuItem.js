import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function MenuItem({ icon, title, onPress, isDark = false }) {
  return (
    <TouchableOpacity
      style={[styles.container, isDark && styles.containerDark]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        <View style={[styles.iconContainer, isDark && styles.iconContainerDark]}>
          <MaterialCommunityIcons
            name={icon}
            size={24}
            color={isDark ? '#E5E5E5' : '#3C3C3B'}
          />
        </View>
        <Text style={[styles.title, isDark && styles.titleDark]}>{title}</Text>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={24}
        color={isDark ? '#9CA3AF' : '#9CA3AF'}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    minHeight: 56,
    borderRadius: 8,
  },
  containerDark: {
    backgroundColor: '#111421',
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 229, 0.1)',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerDark: {
    backgroundColor: '#1F2937',
  },
  title: {
    fontSize: 16,
    color: '#3C3C3B',
    flex: 1,
  },
  titleDark: {
    color: '#E5E5E5',
  },
});
