/**
 * Add Expense Modal — Zarfım
 * Modern minimalist tasarım, sıfır emoji, vektör ikonlar
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, BorderRadius } from '@/lib/theme';
import PrimaryButton from '@/components/PrimaryButton';
import AppIcon from '@/components/AppIcon';
import { useEnvelopesStore } from '@/store/envelopes';
import { useEnvelopes, useMonthlyStats } from '@/lib/hooks/useEnvelopes';
import { queryClient } from '@/lib/queryClient';
import { getCurrencySymbol } from '@/lib/formatCurrency';

export default function AddExpenseModal() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ envelopeId?: string }>();

  const { data: envelopes } = useEnvelopes();
  const stats = useMonthlyStats();
  const addTransaction = useEnvelopesStore((s) => s.addTransaction);

  const [selectedId, setSelectedId] = useState<string>(
    params.envelopeId || envelopes?.[0]?.id || ''
  );
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const numericAmount = parseFloat(amount.replace(',', '.'));

    if (!selectedId || isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert(t('common.error'), t('addExpenseModal.fillAll'));
      return;
    }

    const projectedSpent = stats.totalSpent + numericAmount;

    // Check 100% Limit against totalIncome
    if (stats.totalIncome > 0 && projectedSpent > stats.totalIncome) {
      Alert.alert(t('common.error'), t('addExpenseModal.limitExceeded'));
      return;
    }

    // Check 80% Warning against totalIncome
    if (stats.totalIncome > 0 && projectedSpent >= stats.totalIncome * 0.8 && stats.totalSpent < stats.totalIncome * 0.8) {
      Alert.alert(t('common.info', 'Bilgi'), t('addExpenseModal.eightyPercentWarning'));
    }

    try {
      setIsSubmitting(true);
      await addTransaction({
        envelope_id: selectedId,
        amount: numericAmount,
        note: note.trim() || null,
        occurred_at: new Date().toISOString(),
      });

      await queryClient.invalidateQueries({ queryKey: ['envelopes'] });
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      await queryClient.invalidateQueries({ queryKey: ['incomes'] });

      router.back();
    } catch (e) {
      console.error(e);
      Alert.alert(t('common.error'), t('errors.unknown'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheetHandle} />

        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={20} color={Colors.paper} />
          </Pressable>
          <Text style={styles.title}>{t('addExpenseModal.title')}</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Zarf Seçici */}
          <Text style={styles.label}>{t('addExpenseModal.selectEnvelope')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContainer}
          >
            {(envelopes || []).map((env) => {
              const isSelected = env.id === selectedId;
              return (
                <Pressable
                  key={env.id}
                  onPress={() => setSelectedId(env.id)}
                  style={[
                    styles.chip,
                    isSelected && { backgroundColor: env.color || Colors.stamp, borderColor: 'transparent' },
                  ]}
                >
                  <View style={styles.chipIconContainer}>
                    <AppIcon name={env.icon} size={15} color={isSelected ? '#FFFFFF' : '#8E8E93'} />
                  </View>
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {(env as any).nameKey ? t((env as any).nameKey) : env.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Tutar Girişi */}
          <Text style={styles.label}>{t('addExpenseModal.amount')}</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>{getCurrencySymbol()}</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor="#64748B"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
          </View>

          {/* Not Girişi */}
          <Text style={styles.label}>{t('addExpenseModal.note')}</Text>
          <TextInput
            style={styles.noteInput}
            placeholder={t('addExpenseModal.notePlaceholder')}
            placeholderTextColor="#64748B"
            value={note}
            onChangeText={setNote}
          />

          <View style={styles.submitContainer}>
            <PrimaryButton
              title={t('addExpenseModal.submit')}
              icon="add-outline"
              onPress={handleSubmit}
              disabled={isSubmitting || !selectedId || !amount}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ink,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.lg,
    color: Colors.paper,
  },
  scrollContent: {
    padding: Spacing.xl,
  },
  label: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.sm,
    color: '#CBD5E1',
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  chipsContainer: {
    gap: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inkLight,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md + 2,
  },
  chipIconContainer: {
    marginEnd: Spacing.xs + 2,
  },
  chipText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.sm,
    color: '#94A3B8',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inkLight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  currencySymbol: {
    fontFamily: Fonts.bodyLight,
    fontSize: 28,
    color: Colors.gold,
    marginEnd: Spacing.sm,
  },
  amountInput: {
    flex: 1,
    fontFamily: Fonts.bodySemiBold,
    fontSize: 28,
    color: Colors.paper,
  },
  noteInput: {
    backgroundColor: Colors.inkLight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontFamily: Fonts.body,
    fontSize: FontSizes.md,
    color: Colors.paper,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  submitContainer: {
    marginTop: Spacing.xxl,
  },
});
