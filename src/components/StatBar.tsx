import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, radius, spacing, typography } from '../constants/theme';

interface StatBarProps {
  label: string;
  value: number; // 0-100
  color?: string;
  locked?: boolean;
}

export function StatBar({ label, value, color = colors.gold, locked = false }: StatBarProps) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (locked) return;
    Animated.timing(anim, {
      toValue: value,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [value, locked]);

  const width = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color: locked ? colors.textMuted : color }]}>
          {locked ? 'LOCKED' : `${value}`}
        </Text>
      </View>
      <View style={styles.track}>
        {locked ? (
          <View style={[styles.fill, { width: '100%', backgroundColor: colors.textMuted, opacity: 0.2 }]} />
        ) : (
          <Animated.View style={[styles.fill, { width, backgroundColor: color }]} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
  },
  value: {
    ...typography.caption,
    fontWeight: '600',
  },
  track: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
  },
});
