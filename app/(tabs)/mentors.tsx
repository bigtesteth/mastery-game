import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useUserStore } from '@/stores/useUserStore';
import { useMentorStore } from '@/stores/useMentorStore';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Mentor } from '@/types';
import { HISTORICAL_MENTORS } from '@/constants/masteryKeys';

export default function Mentors() {
  const { lifeTask } = useUserStore();
  const { mentors, load, addMentor, updateRelationship, deleteMentor } = useMentorStore();
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState<'real' | 'historical'>('real');
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lifeTask) load(lifeTask.id);
  }, [lifeTask?.id]);

  const realMentors = mentors.filter((m) => !m.isHistorical);
  const historicalMentors = mentors.filter((m) => m.isHistorical);

  const handleAdd = async (isHistorical = false, historicalName?: string, historicalDomain?: string) => {
    if (!lifeTask) return;
    setLoading(true);
    try {
      await addMentor(
        lifeTask.id,
        isHistorical ? historicalName! : name.trim(),
        isHistorical ? historicalDomain! : domain.trim(),
        isHistorical,
        notes.trim()
      );
      if (!isHistorical) {
        setName('');
        setDomain('');
        setNotes('');
        setShowModal(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Remove Mentor', 'Remove this mentor from your journey?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteMentor(id) },
    ]);
  };

  const addedHistoricalIds = new Set(historicalMentors.map((m) => m.name));

  const renderMentor = ({ item }: { item: Mentor }) => (
    <Card style={styles.mentorCard}>
      <View style={styles.mentorHeader}>
        <View style={styles.mentorInfo}>
          <Text style={styles.mentorName}>{item.name}</Text>
          {item.domain ? <Text style={styles.mentorDomain}>{item.domain}</Text> : null}
          {item.isHistorical && (
            <View style={styles.historicalBadge}>
              <Text style={styles.historicalText}>Historical</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Text style={styles.deleteText}>✕</Text>
        </TouchableOpacity>
      </View>
      {/* Relationship level */}
      <View style={styles.levelRow}>
        <Text style={styles.levelLabel}>Bond Level</Text>
        <View style={styles.levelDots}>
          {([1, 2, 3, 4, 5] as const).map((l) => (
            <TouchableOpacity key={l} onPress={() => updateRelationship(item.id, l)}>
              <View style={[styles.levelDot, item.relationshipLevel >= l && styles.levelDotFilled]} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {item.notes ? <Text style={styles.mentorNotes} numberOfLines={2}>{item.notes}</Text> : null}
    </Card>
  );

  return (
    <Screen scrollable={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Mentors</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Surround yourself with those who embody the mastery you seek.
      </Text>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['real', 'historical'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'real' ? `My Mentors (${realMentors.length})` : `Historical (${historicalMentors.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'real' && (
        <FlatList
          data={realMentors}
          keyExtractor={(item) => item.id}
          renderItem={renderMentor}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                {'No mentors yet.\n\nA mentor accelerates your path. Who in your life embodies mastery in your craft?'}
              </Text>
            </Card>
          }
        />
      )}

      {tab === 'historical' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          <Text style={styles.sectionHint}>
            Study the lives of masters. Add them to your council.
          </Text>
          {historicalMentors.length > 0 && (
            <>
              <Text style={styles.listLabel}>Your Council</Text>
              {historicalMentors.map((item) => (
                <View key={item.id}>
                  {renderMentor({ item })}
                </View>
              ))}
            </>
          )}
          <Text style={styles.listLabel}>Add from the Book</Text>
          {HISTORICAL_MENTORS.filter((h) => !addedHistoricalIds.has(h.name)).map((h) => (
            <Card key={h.name} style={styles.historicalRow}>
              <View style={styles.historicalInfo}>
                <Text style={styles.mentorName}>{h.name}</Text>
                <Text style={styles.mentorDomain}>{h.domain}</Text>
              </View>
              <TouchableOpacity
                style={styles.addHistoricalBtn}
                onPress={() => handleAdd(true, h.name, h.domain)}
              >
                <Text style={styles.addHistoricalText}>+ Add</Text>
              </TouchableOpacity>
            </Card>
          ))}
        </ScrollView>
      )}

      {/* Add real mentor modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add a Mentor</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Mentor's name"
              placeholderTextColor={colors.textMuted}
              autoFocus
            />
            <TextInput
              style={styles.input}
              value={domain}
              onChangeText={setDomain}
              placeholder="Their domain / expertise"
              placeholderTextColor={colors.textMuted}
            />
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Notes about what you're learning from them..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <View style={styles.modalActions}>
              <Button label="Cancel" onPress={() => setShowModal(false)} variant="ghost" />
              <Button label="Add" onPress={() => handleAdd(false)} disabled={!name.trim()} loading={loading} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  title: { ...typography.displayMedium, color: colors.textPrimary },
  subtitle: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.md, lineHeight: 20 },
  addBtn: { backgroundColor: colors.gold, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full },
  addBtnText: { ...typography.bodySmall, color: colors.bg, fontWeight: '700' },
  tabs: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  tab: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  tabActive: { borderColor: colors.gold, backgroundColor: colors.goldFaint },
  tabText: { ...typography.bodySmall, color: colors.textSecondary },
  tabTextActive: { color: colors.gold, fontWeight: '600' },
  list: { gap: spacing.sm, paddingBottom: spacing.xl },
  sectionHint: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.sm },
  listLabel: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm, marginTop: spacing.sm },
  mentorCard: { gap: spacing.sm },
  mentorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  mentorInfo: { flex: 1, gap: 2 },
  mentorName: { ...typography.subtitle, color: colors.textPrimary },
  mentorDomain: { ...typography.bodySmall, color: colors.textSecondary },
  historicalBadge: { borderWidth: 1, borderColor: colors.gold, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 1, alignSelf: 'flex-start', marginTop: 2 },
  historicalText: { ...typography.caption, color: colors.gold },
  deleteText: { color: colors.textMuted, fontSize: 12 },
  levelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  levelLabel: { ...typography.caption, color: colors.textMuted },
  levelDots: { flexDirection: 'row', gap: 6 },
  levelDot: { width: 12, height: 12, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: 'transparent' },
  levelDotFilled: { backgroundColor: colors.gold, borderColor: colors.gold },
  mentorNotes: { ...typography.caption, color: colors.textSecondary, lineHeight: 18 },
  historicalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historicalInfo: { flex: 1 },
  addHistoricalBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, borderWidth: 1, borderColor: colors.gold },
  addHistoricalText: { ...typography.caption, color: colors.gold, fontWeight: '600' },
  emptyCard: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalContent: { backgroundColor: colors.bgElevated, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, gap: spacing.md },
  modalTitle: { ...typography.title, color: colors.textPrimary },
  input: { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, color: colors.textPrimary, fontSize: 15 },
  multilineInput: { minHeight: 80, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },
});
