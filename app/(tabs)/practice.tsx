import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { useUserStore } from '@/stores/useUserStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { PracticeSession, SessionType } from '@/types';

const TYPE_COLORS: Record<SessionType, string> = {
  deliberate: colors.deliberate,
  observational: colors.observational,
  passive: colors.passive,
};

export default function Practice() {
  const { lifeTask } = useUserStore();
  const { sessions, load, deleteSession, isLoading } = useSessionStore();
  const [filter, setFilter] = useState<SessionType | 'all'>('all');

  useEffect(() => {
    if (lifeTask) load(lifeTask.id);
  }, [lifeTask?.id]);

  const filtered = filter === 'all' ? sessions : sessions.filter((s) => s.type === filter);

  const totalByType = {
    deliberate: sessions.filter((s) => s.type === 'deliberate').reduce((sum, s) => sum + s.durationMinutes, 0),
    observational: sessions.filter((s) => s.type === 'observational').reduce((sum, s) => sum + s.durationMinutes, 0),
    passive: sessions.filter((s) => s.type === 'passive').reduce((sum, s) => sum + s.durationMinutes, 0),
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Session', 'Remove this practice session?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteSession(id) },
    ]);
  };

  const renderSession = ({ item }: { item: PracticeSession }) => (
    <Card style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <View style={[styles.typeDot, { backgroundColor: TYPE_COLORS[item.type] }]} />
        <Text style={styles.sessionType}>{item.type}</Text>
        <Text style={styles.sessionDate}>{formatDate(item.date)}</Text>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
          <Text style={styles.deleteText}>✕</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.sessionStats}>
        <Text style={styles.duration}>{item.durationMinutes}m</Text>
        <QualityBar quality={item.quality} />
      </View>
      {item.notes ? <Text style={styles.notes} numberOfLines={3}>{item.notes}</Text> : null}
    </Card>
  );

  return (
    <Screen scrollable={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Practice Log</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/log-session')}>
          <Text style={styles.addBtnText}>+ Log</Text>
        </TouchableOpacity>
      </View>

      {/* Summary cards */}
      <View style={styles.summaryRow}>
        {(['deliberate', 'observational', 'passive'] as SessionType[]).map((type) => (
          <Card key={type} style={styles.summaryCard}>
            <View style={[styles.typeDot, { backgroundColor: TYPE_COLORS[type] }]} />
            <Text style={styles.summaryHours}>{(totalByType[type] / 60).toFixed(1)}h</Text>
            <Text style={styles.summaryType}>{type.slice(0, 3)}</Text>
          </Card>
        ))}
      </View>

      {/* Filter */}
      <View style={styles.filterRow}>
        {(['all', 'deliberate', 'observational', 'passive'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Session list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderSession}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No sessions yet. Start logging your practice.</Text>
          </Card>
        }
      />
    </Screen>
  );
}

function QualityBar({ quality }: { quality: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            backgroundColor: i <= quality ? colors.gold : colors.border,
          }}
        />
      ))}
    </View>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: { ...typography.displayMedium, color: colors.textPrimary },
  addBtn: {
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  addBtnText: { ...typography.bodySmall, color: colors.bg, fontWeight: '700' },
  summaryRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  summaryCard: { flex: 1, alignItems: 'center', gap: 2 },
  summaryHours: { ...typography.title, color: colors.textPrimary },
  summaryType: { ...typography.caption, color: colors.textSecondary, textTransform: 'capitalize' },
  typeDot: { width: 8, height: 8, borderRadius: 999 },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { borderColor: colors.gold, backgroundColor: colors.goldFaint },
  filterText: { ...typography.caption, color: colors.textSecondary },
  filterTextActive: { color: colors.gold, fontWeight: '600' },
  list: { gap: spacing.sm, paddingBottom: spacing.xl },
  sessionCard: { gap: spacing.sm },
  sessionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sessionType: { ...typography.bodySmall, color: colors.textPrimary, textTransform: 'capitalize', fontWeight: '600', flex: 1 },
  sessionDate: { ...typography.caption, color: colors.textMuted },
  deleteBtn: { padding: spacing.xs },
  deleteText: { color: colors.textMuted, fontSize: 12 },
  sessionStats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  duration: { ...typography.title, color: colors.gold },
  notes: { ...typography.caption, color: colors.textSecondary, lineHeight: 18 },
  emptyCard: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
});
