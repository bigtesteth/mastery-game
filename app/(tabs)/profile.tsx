import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { StatBar } from '@/components/StatBar';
import { PhaseTag } from '@/components/PhaseTag';
import { useUserStore } from '@/stores/useUserStore';
import { useProgressStore } from '@/stores/useProgressStore';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { MASTERY_KEYS, PHASE_THRESHOLDS } from '@/constants/masteryKeys';
import { MasteryKey } from '@/types';

export default function Profile() {
  const { user, lifeTask } = useUserStore();
  const { progress, load } = useProgressStore();

  useEffect(() => {
    if (lifeTask) load(lifeTask.id);
  }, [lifeTask?.id]);

  if (!user || !lifeTask) return null;

  const totalHours = lifeTask.totalMinutes / 60;
  const unlockedIds = new Set(progress?.unlockedKeyIds ?? []);
  const unlockedKeys = MASTERY_KEYS.filter((k) => unlockedIds.has(k.id));
  const lockedKeys = MASTERY_KEYS.filter((k) => !unlockedIds.has(k.id));

  const nextPhaseMinutes =
    lifeTask.phase === 'apprentice'
      ? PHASE_THRESHOLDS.creative
      : lifeTask.phase === 'creative'
      ? PHASE_THRESHOLDS.master
      : null;

  const phaseProgress = nextPhaseMinutes
    ? Math.min((lifeTask.totalMinutes / nextPhaseMinutes) * 100, 100)
    : 100;

  const nextKeyMinutes = lockedKeys[0]?.unlockedAtMinutes ?? null;
  const nextKeyProgress = nextKeyMinutes
    ? Math.min((lifeTask.totalMinutes / nextKeyMinutes) * 100, 100)
    : 100;

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name[0].toUpperCase()}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.craftName}>{lifeTask.customName}</Text>
          <PhaseTag phase={lifeTask.phase} />
        </View>
      </View>

      {/* Total hours */}
      <Card style={styles.hoursCard}>
        <Text style={styles.hoursValue}>{totalHours.toFixed(1)}</Text>
        <Text style={styles.hoursLabel}>Total Hours Logged</Text>
        {nextPhaseMinutes && (
          <View style={styles.phaseProgress}>
            <View style={styles.phaseProgressRow}>
              <Text style={styles.phaseProgressLabel}>
                {((nextPhaseMinutes - lifeTask.totalMinutes) / 60).toFixed(0)}h to next phase
              </Text>
              <Text style={styles.phaseProgressPct}>{Math.round(phaseProgress)}%</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${phaseProgress}%` }]} />
            </View>
          </View>
        )}
        {lifeTask.phase === 'master' && (
          <Text style={styles.masterText}>You have achieved Mastery.</Text>
        )}
      </Card>

      {/* Stats */}
      <Card style={styles.statsCard}>
        <Text style={styles.sectionTitle}>Mastery Stats</Text>
        <View style={styles.streakRow}>
          <View style={styles.streakItem}>
            <Text style={styles.streakValue}>{progress?.currentStreak ?? 0}</Text>
            <Text style={styles.streakLabel}>Current Streak</Text>
          </View>
          <View style={styles.streakDivider} />
          <View style={styles.streakItem}>
            <Text style={styles.streakValue}>{progress?.longestStreak ?? 0}</Text>
            <Text style={styles.streakLabel}>Longest Streak</Text>
          </View>
          <View style={styles.streakDivider} />
          <View style={styles.streakItem}>
            <Text style={styles.streakValue}>{progress?.totalXp ?? 0}</Text>
            <Text style={styles.streakLabel}>Total XP</Text>
          </View>
        </View>
      </Card>

      {/* Attribute bars */}
      <Card style={styles.statsCard}>
        <Text style={styles.sectionTitle}>Attributes</Text>
        <StatBar label="Focus" value={progress?.focus ?? 0} />
        <StatBar label="Discipline" value={progress?.discipline ?? 0} />
        <StatBar label="Creativity" value={progress?.creativity ?? 0} color={colors.observational} />
        <StatBar
          label="Intuition"
          value={progress?.intuition ?? 0}
          color={colors.creative}
          locked={lifeTask.phase === 'apprentice'}
        />
        <StatBar
          label="Social Intelligence"
          value={progress?.socialIntelligence ?? 0}
          color={colors.apprentice}
        />
      </Card>

      {/* Keys to Mastery */}
      <View style={styles.keysSection}>
        <Text style={styles.sectionTitle}>Keys to Mastery</Text>
        <Text style={styles.keysSubtitle}>
          {unlockedKeys.length} of {MASTERY_KEYS.length} unlocked
        </Text>

        {unlockedKeys.map((key) => (
          <KeyCard key={key.id} masteryKey={key} locked={false} />
        ))}

        {lockedKeys.slice(0, 3).map((key, i) => (
          <KeyCard key={key.id} masteryKey={key} locked />
        ))}
      </View>

      {/* Next key progress */}
      {nextKeyMinutes && (
        <Card style={styles.nextKeyCard}>
          <Text style={styles.nextKeyLabel}>Next Key Unlocks At</Text>
          <Text style={styles.nextKeyHours}>{(nextKeyMinutes / 60).toFixed(0)}h</Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${nextKeyProgress}%` }]} />
          </View>
        </Card>
      )}
    </Screen>
  );
}

function KeyCard({ masteryKey, locked }: { masteryKey: MasteryKey; locked: boolean }) {
  return (
    <Card style={locked ? [styles.keyCard, styles.keyCardLocked] : styles.keyCard}>
      {locked ? (
        <View style={styles.lockedContent}>
          <Text style={styles.lockIcon}>🔒</Text>
          <View>
            <Text style={styles.keyTitleLocked}>{masteryKey.title}</Text>
            <Text style={styles.keyUnlockHint}>
              Unlock at {(masteryKey.unlockedAtMinutes / 60).toFixed(0)}h
            </Text>
          </View>
        </View>
      ) : (
        <>
          <Text style={styles.keyTitle}>{masteryKey.title}</Text>
          <Text style={styles.keyQuote}>"{masteryKey.quote}"</Text>
          <Text style={styles.keyAuthor}>— {masteryKey.author}</Text>
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: colors.goldFaint, borderWidth: 2, borderColor: colors.gold,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { ...typography.displayMedium, color: colors.gold },
  headerInfo: { flex: 1, gap: spacing.xs },
  userName: { ...typography.title, color: colors.textPrimary },
  craftName: { ...typography.body, color: colors.textSecondary },
  hoursCard: { alignItems: 'center', marginBottom: spacing.md, gap: spacing.sm },
  hoursValue: { fontSize: 56, fontWeight: '700', color: colors.gold, letterSpacing: -2 },
  hoursLabel: { ...typography.label, color: colors.textSecondary },
  phaseProgress: { width: '100%', gap: spacing.xs },
  phaseProgressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  phaseProgressLabel: { ...typography.caption, color: colors.textMuted },
  phaseProgressPct: { ...typography.caption, color: colors.gold },
  track: { height: 3, backgroundColor: colors.border, borderRadius: radius.full, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.gold, borderRadius: radius.full },
  masterText: { ...typography.bodySmall, color: colors.gold, textAlign: 'center', fontStyle: 'italic' },
  statsCard: { marginBottom: spacing.md },
  sectionTitle: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.md },
  streakRow: { flexDirection: 'row', justifyContent: 'space-around' },
  streakItem: { alignItems: 'center', gap: 2 },
  streakValue: { ...typography.displayMedium, color: colors.textPrimary },
  streakLabel: { ...typography.caption, color: colors.textSecondary },
  streakDivider: { width: 1, backgroundColor: colors.border },
  keysSection: { gap: spacing.sm, marginBottom: spacing.md },
  keysSubtitle: { ...typography.bodySmall, color: colors.textMuted, marginBottom: spacing.xs },
  keyCard: { gap: spacing.sm },
  keyCardLocked: { opacity: 0.5 },
  lockedContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  lockIcon: { fontSize: 20 },
  keyTitle: { ...typography.subtitle, color: colors.gold },
  keyTitleLocked: { ...typography.subtitle, color: colors.textSecondary },
  keyUnlockHint: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  keyQuote: { ...typography.body, color: colors.textSecondary, lineHeight: 22, fontStyle: 'italic' },
  keyAuthor: { ...typography.caption, color: colors.textMuted, textAlign: 'right' },
  nextKeyCard: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xl, padding: spacing.lg },
  nextKeyLabel: { ...typography.label, color: colors.textSecondary },
  nextKeyHours: { ...typography.displayMedium, color: colors.gold },
});
