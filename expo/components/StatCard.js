import { View, Text, StyleSheet } from 'react-native';

export default function StatCard({ title, value, backgroundColor, textColor }) {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor || '#3C3C3B' }]}>{title}</Text>
      <Text style={[styles.value, { color: textColor || '#3C3C3B' }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 158,
    padding: 24,
    borderRadius: 12,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
});
