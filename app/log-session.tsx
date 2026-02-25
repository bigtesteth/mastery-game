import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '@/stores/useUserStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { useProgressStore } from '@/stores/useProgressStore';
import { useMentorStore } from '@/stores/useMentorStore';
import { Button } from '@/components/Button';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { SessionType } from '@/types';
import * as Haptics from 'expo-haptics';

const SESSION_TYPES: { type: SessionType; label: string; description: string }[] = [
  { type: 'deliberate', label: 'Deliberate', description: 'Focused, intentional practice at your edge' },
  { type: 'observational', label: 'Observational', description: 'Studying masters, watching, analyzing' },
  { type: 'passive', label: 'Passive', description: 'General exposure, casual engagement' },
];

const DURATIONS = [15, 30, 45, 60, 90, 120];

export default function LogSession() {
  const { lifeTask, addMinutes } = useUserStore();
  const { addSession, sessions } = useSessionStore();
  const { recalculate, checkUnlocks, addXp } = useProgressStore();
  const { mentors } = useMentorStore();

  const [sessionType, setSessionType] = useState<SessionType>('deliberate');
  const [duration, setDuration] = useState(45);
  const [quality, setQuality] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!lifeTask) return;
    setLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await addSession(lifeTask.id, duration, quality, sessionType, notes.trim());
      await addMinutes(duration);

      const allSessions = [...sessions];
      const newTotal = lifeTask.totalMinutes + duration;
      const maxLevel = mentors.length > 0 ? Math.max(...mentors.map((m) => m.relationshipLevel)) : 0;
      await recalculate(lifeTask.id, allSessions, newTotal, mentors.length, maxLevel);

      const newlyUnlocked = await checkUnlocks(lifeTask.id, newTotal);
      if (newlyUnlocked.length > 0) {
        const xp = duration * (quality / 5) * 2;
        await addXp(lifeTask.id, Math.round(xp));
        Alert.alert('Key to Mastery Unlocked!', 'Check your Profile to read your new insight.');
      } else {
        const xp = duration * (quality / 5) * 2;
        await addXp(lifeTask.id, Math.round(xp));
      }

      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Log Session</Text>
            <View style={{ width: 50 }} />
          </View>

          {/* Session type */}
          <Text style={styles.sectionLabel}>Session Type</Text>
          <View style={styles.typeList}>
            {SESSION_TYPES.map(({ type, label, description }) => (
              <TouchableOpacity
                key={type}
                style={[styles.typeCard, sessionType === type && styles.typeCardSelected]}
                onPress={() => setSessionType(type)}
              >
                <Text style={[styles.typeLabel, sessionType === type && styles.typeLabelSelected]}>{label}</Text>
                <Text style={styles.typeDesc}>{description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Duration */}
          <Text style={styles.sectionLabel}>Duration</Text>
          <View style={styles.durationRow}>
            {DURATIONS.map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.durationChip, duration === d && styles.durationChipSelected]}
                onPress={() => setDuration(d)}
              >
                <Text style={[styles.durationText, duration === d && styles.durationTextSelected]}>
                  {d}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quality */}
          <Text style={styles.sectionLabel}>Session Quality</Text>
          <View style={styles.qualityRow}>
            {([1, 2, 3, 4, 5] as const).map((q) => (
              <TouchableOpacity
                key={q}
                style={[styles.qualityDot, quality === q && styles.qualityDotSelected]}
                onPress={() => setQuality(q)}
              >
                <Text style={[styles.qualityText, quality === q && styles.qualityTextSelected]}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.qualityHint}>
            {quality === 1 ? 'Scattered — hard to focus' :
             quality === 2 ? 'Below average — frequent distractions' :
             quality === 3 ? 'Average — some good stretches' :
             quality === 4 ? 'Good — deep work for most of it' :
             'Flow state — complete immersion'}
          </Text>

          {/* Notes */}
          <Text style={styles.sectionLabel}>Notes (optional)</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="What did you work on? Any insights?"
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Button
            label={`Log ${duration} min of ${sessionType} practice`}
            onPress={handleSave}
            loading={loading}
            fullWidth
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  kav: { flex: 1 },
  scroll: { padding: spacing.md, gap: spacing.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cancel: { ...typography.body, color: colors.textSecondary },
  title: { ...typography.subtitle, color: colors.textPrimary },
  sectionLabel: { ...typography.label, color: colors.textSecondary },
  typeList: { gap: spacing.sm },
  typeCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  typeCardSelected: { borderColor: colors.gold, backgroundColor: colors.goldFaint },
  typeLabel: { ...typography.subtitle, color: colors.textPrimary },
  typeLabelSelected: { color: colors.gold },
  typeDesc: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  durationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  durationChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  durationChipSelected: { borderColor: colors.gold, backgroundColor: colors.goldFaint },
  durationText: { ...typography.bodySmall, color: colors.textSecondary },
  durationTextSelected: { color: colors.gold, fontWeight: '600' },
  qualityRow: { flexDirection: 'row', gap: spacing.sm },
  qualityDot: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qualityDotSelected: { borderColor: colors.gold, backgroundColor: colors.goldFaint },
  qualityText: { ...typography.subtitle, color: colors.textSecondary },
  qualityTextSelected: { color: colors.gold },
  qualityHint: { ...typography.caption, color: colors.textMuted, fontStyle: 'italic' },
  notesInput: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: 15,
    minHeight: 100,
  },
  saveButton: { marginTop: spacing.sm },
});
