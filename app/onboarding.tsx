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
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '@/stores/useUserStore';
import { Button } from '@/components/Button';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { DOMAIN_LABELS } from '@/constants/masteryKeys';
import { Domain } from '@/types';

const DOMAINS = Object.entries(DOMAIN_LABELS) as [Domain, string][];

type Step = 'welcome' | 'name' | 'domain' | 'custom';

export default function Onboarding() {
  const { createUser, setLifeTask, completeOnboarding } = useUserStore();
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [customName, setCustomName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!name.trim() || !selectedDomain || !customName.trim()) return;
    setLoading(true);
    try {
      await createUser(name.trim());
      await setLifeTask(selectedDomain, customName.trim());
      await completeOnboarding();
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {step === 'welcome' && (
            <View style={styles.section}>
              <Text style={styles.eyebrow}>Begin your journey</Text>
              <Text style={styles.title}>Mastery</Text>
              <Text style={styles.body}>
                {"The path to mastery is not a sprint — it's a lifelong dedication to your craft.\n\nLog your real practice. Track your growth. Become who you were meant to be."}
              </Text>
              <Button label="Begin" onPress={() => setStep('name')} fullWidth style={styles.cta} />
            </View>
          )}

          {step === 'name' && (
            <View style={styles.section}>
              <Text style={styles.eyebrow}>Step 1 of 3</Text>
              <Text style={styles.title}>Your name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={colors.textMuted}
                autoFocus
                returnKeyType="next"
                onSubmitEditing={() => name.trim() && setStep('domain')}
              />
              <Button
                label="Continue"
                onPress={() => setStep('domain')}
                disabled={!name.trim()}
                fullWidth
                style={styles.cta}
              />
            </View>
          )}

          {step === 'domain' && (
            <View style={styles.section}>
              <Text style={styles.eyebrow}>Step 2 of 3</Text>
              <Text style={styles.title}>Your Life's Task</Text>
              <Text style={styles.body}>
                What is the craft you feel called to master?
              </Text>
              <View style={styles.domainGrid}>
                {DOMAINS.map(([domain, label]) => (
                  <TouchableOpacity
                    key={domain}
                    style={[
                      styles.domainChip,
                      selectedDomain === domain && styles.domainChipSelected,
                    ]}
                    onPress={() => setSelectedDomain(domain)}
                  >
                    <Text
                      style={[
                        styles.domainLabel,
                        selectedDomain === domain && styles.domainLabelSelected,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Button
                label="Continue"
                onPress={() => setStep('custom')}
                disabled={!selectedDomain}
                fullWidth
                style={styles.cta}
              />
            </View>
          )}

          {step === 'custom' && (
            <View style={styles.section}>
              <Text style={styles.eyebrow}>Step 3 of 3</Text>
              <Text style={styles.title}>Name your craft</Text>
              <Text style={styles.body}>
                Be specific. Not just "Music" — "Classical Guitar". Not just "Coding" — "Machine Learning".
              </Text>
              <TextInput
                style={styles.input}
                value={customName}
                onChangeText={setCustomName}
                placeholder={`e.g. ${selectedDomain === 'music' ? 'Jazz Piano' : selectedDomain === 'coding' ? 'Systems Programming' : 'Your specific craft'}`}
                placeholderTextColor={colors.textMuted}
                autoFocus
                returnKeyType="done"
              />
              <Button
                label="Begin My Journey"
                onPress={handleStart}
                disabled={!customName.trim()}
                loading={loading}
                fullWidth
                style={styles.cta}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  section: { gap: spacing.md },
  eyebrow: {
    ...typography.label,
    color: colors.gold,
  },
  title: {
    ...typography.displayLarge,
    color: colors.textPrimary,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  input: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: 16,
    marginTop: spacing.sm,
  },
  domainGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  domainChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  domainChipSelected: {
    borderColor: colors.gold,
    backgroundColor: colors.goldFaint,
  },
  domainLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  domainLabelSelected: {
    color: colors.gold,
    fontWeight: '600',
  },
  cta: {
    marginTop: spacing.lg,
  },
});
