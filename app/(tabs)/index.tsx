import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { PhaseTag } from '@/components/PhaseTag';
import { useUserStore } from '@/stores/useUserStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { useProgressStore } from '@/stores/useProgressStore';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { PHASE_THRESHOLDS } from '@/constants/masteryKeys';

export default function Dashboard() {
  const { user, lifeTask } = useUserStore();
  const { sessions, load: loadSessions, getTodayMinutes } = useSessionStore();
  const { progress, load: loadProgress } = useProgressStore();

  useEffect(() => {
    if (lifeTask) {
      loadSessions(lifeTask.id);
      loadProgress(lifeTask.id);
    }
  }, [lifeTask?.id]);

  if (!user || !lifeTask) return null;

  const todayMinutes = getTodayMinutes();
  const totalHours = (lifeTask.totalMinutes / 60).toFixed(1);
  const nextPhaseMinutes =
    lifeTask.phase === 'apprentice'
      ? PHASE_THRESHOLDS.creative
      : lifeTask.phase === 'creative'
      ? PHASE_THRESHOLDS.master
      : null;

  const phaseProgress = nextPhaseMinutes
    ? Math.min((lifeTask.totalMinutes / nextPhaseMinutes) * 100, 100)
    : 100;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good {getTimeOfDay()}, {user.name}</Text>
          <Text style={styles.date}>{today}</Text>
        </View>
        <PhaseTag phase={lifeTask.phase} />
      </View>

      {/* Life Task card */}
      <Card style={styles.heroCard}>
        <Text style={styles.heroLabel}>Your Life's Task</Text>
        <Text style={styles.heroTask}>{lifeTask.customName}</Text>

        {/* Phase progress bar */}
        <View style={styles.phaseRow}>
          <Text style={styles.hoursText}>{totalHours}h logged</Text>
          {nextPhaseMinutes && (
            <Text style={styles.hoursText}>
              {((nextPhaseMinutes - lifeTask.totalMinutes) / 60).toFixed(0)}h to next phase
            </Text>
          )}
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${phaseProgress}%` }]} />
        </View>
      </Card>

      {/* Today stats */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{todayMinutes}</Text>
          <Text style={styles.statLabel}>min today</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{progress?.currentStreak ?? 0}</Text>
          <Text style={styles.statLabel}>day streak</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{sessions.length}</Text>
          <Text style={styles.statLabel}>sessions</Text>
        </Card>
      </View>

      {/* Log session CTA */}
      <TouchableOpacity style={styles.logButton} onPress={() => router.push('/log-session')}>
        <Text style={styles.logButtonText}>+ Log Practice Session</Text>
      </TouchableOpacity>

      {/* Recent sessions */}
      {sessions.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          {sessions.slice(0, 3).map((session) => (
            <Card key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionRow}>
                <View>
                  <Text style={styles.sessionType}>{session.type}</Text>
                  <Text style={styles.sessionDate}>{session.date}</Text>
                </View>
                <View style={styles.sessionRight}>
                  <Text style={styles.sessionDuration}>{session.durationMinutes}m</Text>
                  <QualityDots quality={session.quality} />
                </View>
              </View>
              {session.notes ? (
                <Text style={styles.sessionNotes} numberOfLines={2}>{session.notes}</Text>
              ) : null}
            </Card>
          ))}
        </View>
      )}

      {sessions.length === 0 && (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            {"No sessions yet.\nLog your first practice to begin the journey."}
          </Text>
        </Card>
      )}
    </Screen>
  );
}

function QualityDots({ quality }: { quality: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3, marginTop: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: 999,
            backgroundColor: i <= quality ? colors.gold : colors.border,
          }}
        />
      ))}
    </View>
  );
}

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.title,
    color: colors.textPrimary,
  },
  date: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  heroCard: {
    marginBottom: spacing.md,
  },
  heroLabel: {
    ...typography.label,
    color: colors.gold,
    marginBottom: spacing.xs,
  },
  heroTask: {
    ...typography.displayMedium,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  phaseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  hoursText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  progressTrack: {
    height: 3,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.gold,
    borderRadius: radius.full,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statValue: {
    ...typography.displayMedium,
    color: colors.gold,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logButton: {
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logButtonText: {
    ...typography.subtitle,
    color: colors.bg,
  },
  recentSection: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  sessionCard: {
    gap: spacing.xs,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sessionType: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  sessionDate: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  sessionRight: {
    alignItems: 'flex-end',
  },
  sessionDuration: {
    ...typography.bodySmall,
    color: colors.gold,
    fontWeight: '600',
  },
  sessionNotes: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
