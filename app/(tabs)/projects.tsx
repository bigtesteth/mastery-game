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
} from 'react-native';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useUserStore } from '@/stores/useUserStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { useProgressStore } from '@/stores/useProgressStore';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Project } from '@/types';

export default function Projects() {
  const { lifeTask } = useUserStore();
  const { projects, load, addProject, completeProject, deleteProject } = useProjectStore();
  const { addXp } = useProgressStore();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'active' | 'done'>('active');

  useEffect(() => {
    if (lifeTask) load(lifeTask.id);
  }, [lifeTask?.id]);

  const active = projects.filter((p) => !p.isCompleted);
  const done = projects.filter((p) => p.isCompleted);
  const displayed = tab === 'active' ? active : done;

  const handleAdd = async () => {
    if (!lifeTask || !title.trim()) return;
    setLoading(true);
    try {
      await addProject(lifeTask.id, title.trim(), description.trim(), null);
      setTitle('');
      setDescription('');
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (project: Project) => {
    Alert.alert('Complete Project', `Mark "${project.title}" as complete?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Complete',
        onPress: async () => {
          await completeProject(project.id);
          if (lifeTask) await addXp(lifeTask.id, project.xpReward);
        },
      },
    ]);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Project', 'Remove this project?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteProject(id) },
    ]);
  };

  const renderProject = ({ item }: { item: Project }) => (
    <Card style={styles.projectCard}>
      <View style={styles.projectHeader}>
        <Text style={[styles.projectTitle, item.isCompleted && styles.completedTitle]}>
          {item.title}
        </Text>
        <View style={styles.projectActions}>
          {!item.isCompleted && (
            <TouchableOpacity onPress={() => handleComplete(item)} style={styles.actionBtn}>
              <Text style={styles.completeText}>✓</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
            <Text style={styles.deleteText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
      {item.description ? (
        <Text style={styles.projectDesc} numberOfLines={2}>{item.description}</Text>
      ) : null}
      <View style={styles.projectFooter}>
        <Text style={styles.xpText}>+{item.xpReward} XP</Text>
        {item.completedAt && (
          <Text style={styles.completedAt}>
            Completed {new Date(item.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        )}
      </View>
    </Card>
  );

  return (
    <Screen scrollable={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Projects</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.addBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{active.length}</Text>
          <Text style={styles.statLabel}>active</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{done.length}</Text>
          <Text style={styles.statLabel}>completed</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{done.reduce((s, p) => s + p.xpReward, 0)}</Text>
          <Text style={styles.statLabel}>XP earned</Text>
        </Card>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['active', 'done'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'active' ? `Active (${active.length})` : `Done (${done.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={displayed}
        keyExtractor={(item) => item.id}
        renderItem={renderProject}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              {tab === 'active'
                ? 'No active projects.\nCreate a real-world goal to work toward.'
                : 'No completed projects yet.'}
            </Text>
          </Card>
        }
      />

      {/* Add modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Project</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Project title"
              placeholderTextColor={colors.textMuted}
              autoFocus
            />
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={description}
              onChangeText={setDescription}
              placeholder="Description (optional)"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <View style={styles.modalActions}>
              <Button label="Cancel" onPress={() => setShowModal(false)} variant="ghost" />
              <Button label="Create" onPress={handleAdd} disabled={!title.trim()} loading={loading} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  title: { ...typography.displayMedium, color: colors.textPrimary },
  addBtn: { backgroundColor: colors.gold, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full },
  addBtnText: { ...typography.bodySmall, color: colors.bg, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  statCard: { flex: 1, alignItems: 'center' },
  statValue: { ...typography.title, color: colors.gold },
  statLabel: { ...typography.caption, color: colors.textSecondary },
  tabs: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  tab: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  tabActive: { borderColor: colors.gold, backgroundColor: colors.goldFaint },
  tabText: { ...typography.bodySmall, color: colors.textSecondary },
  tabTextActive: { color: colors.gold, fontWeight: '600' },
  list: { gap: spacing.sm, paddingBottom: spacing.xl },
  projectCard: { gap: spacing.sm },
  projectHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  projectTitle: { ...typography.subtitle, color: colors.textPrimary, flex: 1 },
  completedTitle: { color: colors.textMuted, textDecorationLine: 'line-through' },
  projectActions: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: { padding: spacing.xs },
  completeText: { color: colors.success, fontSize: 16, fontWeight: '700' },
  deleteText: { color: colors.textMuted, fontSize: 12 },
  projectDesc: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 20 },
  projectFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  xpText: { ...typography.caption, color: colors.gold, fontWeight: '600' },
  completedAt: { ...typography.caption, color: colors.textMuted },
  emptyCard: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalContent: { backgroundColor: colors.bgElevated, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, gap: spacing.md },
  modalTitle: { ...typography.title, color: colors.textPrimary },
  input: { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, color: colors.textPrimary, fontSize: 15 },
  multilineInput: { minHeight: 80, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },
});
