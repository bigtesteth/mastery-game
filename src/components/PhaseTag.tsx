import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Phase } from '../types';
import { colors, radius, spacing, typography } from '../constants/theme';

const PHASE_CONFIG: Record<Phase, { label: string; color: string }> = {
  apprentice: { label: 'Apprentice', color: colors.apprentice },
  creative: { label: 'Creative-Active', color: colors.creative },
  master: { label: 'Master', color: colors.master },
};

interface PhaseTagProps {
  phase: Phase;
}

export function PhaseTag({ phase }: PhaseTagProps) {
  const { label, color } = PHASE_CONFIG[phase];
  return (
    <View style={[styles.tag, { borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.label,
  },
});
