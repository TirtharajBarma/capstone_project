import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Toast({ visible, message, type = 'info', onHide }) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onHide) onHide();
      });
    }
  }, [visible]);

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'check-circle',
          backgroundColor: '#ECFDF5',
          borderColor: '#10B981',
          iconColor: '#059669',
          textColor: '#065F46',
        };
      case 'error':
        return {
          icon: 'alert-circle',
          backgroundColor: '#FEF2F2',
          borderColor: '#EF4444',
          iconColor: '#DC2626',
          textColor: '#991B1B',
        };
      case 'warning':
        return {
          icon: 'alert',
          backgroundColor: '#FFFBEB',
          borderColor: '#F59E0B',
          iconColor: '#D97706',
          textColor: '#92400E',
        };
      default:
        return {
          icon: 'information',
          backgroundColor: '#EFF6FF',
          borderColor: '#3B82F6',
          iconColor: '#2563EB',
          textColor: '#1E40AF',
        };
    }
  };

  const config = getToastConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + (Platform.OS === 'android' ? 10 : 0),
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={[styles.content, { backgroundColor: config.backgroundColor, borderColor: config.borderColor }]}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={config.icon} size={24} color={config.iconColor} />
        </View>
        <View style={styles.messageContainer}>
          <Text style={[styles.message, { color: config.textColor }]}>
            {message}
          </Text>
        </View>
        <TouchableOpacity onPress={onHide} style={styles.closeButton}>
          <MaterialCommunityIcons name="close" size={18} color={config.iconColor} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    width: '100%',
    maxWidth: 400,
  },
  iconContainer: {
    marginRight: 12,
  },
  messageContainer: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
});
