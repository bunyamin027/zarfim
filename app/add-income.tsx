/**
 * Add Income Modal — Zarfım
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
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors, Fonts, FontSizes, Spacing, BorderRadius } from '@/lib/theme';
import PrimaryButton from '@/components/PrimaryButton';
import { useEnvelopesStore } from '@/store/envelopes';
import { useIncomeCategories } from '@/lib/hooks/useEnvelopes';
import { queryClient } from '@/lib/queryClient';
import { getCurrencySymbol } from '@/lib/formatCurrency';

export default function AddIncomeModal() {
  const { t } = useTranslation();
  const router = useRouter();

  const { data: categories } = useIncomeCategories();
  const addIncome = useEnvelopesStore((s) => s.addIncome);

  const [selectedId, setSelectedId] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const numericAmount = parseFloat(amount.replace(',', '.'));

    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert(t('common.error'), t('addIncomeModal.fillAll'));
      return;
    }

    try {
      setIsSubmitting(true);
      await addIncome({
        category_id: selectedId || null,
        amount: numericAmount,
        note: note.trim() || null,
        occurred_at: new Date().toISOString(),
      });

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
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
          <Text style={styles.title}>{t('addIncomeModal.title')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Kategori Seçici */}
          <Text style={styles.label}>{t('addIncomeModal.selectCategory')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContainer}
          >
            {(categories || []).map((cat) => {
              const isSelected = cat.id === selectedId;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setSelectedId(isSelected ? '' : cat.id)}
                  style={[
                    styles.chip,
                    isSelected && { backgroundColor: cat.color || Colors.sage, borderColor: Colors.paper },
                  ]}
                >
                  <Text style={styles.chipIcon}>{cat.icon}</Text>
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {cat.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Tutar Girişi */}
          <Text style={styles.label}>{t('addIncomeModal.amount')}</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>{getCurrencySymbol()}</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor={Colors.paperDark}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
          </View>

          {/* Not / Açıklama */}
          <Text style={styles.label}>{t('addIncomeModal.note')}</Text>
          <TextInput
            style={styles.noteInput}
            placeholder={t('addIncomeModal.notePlaceholder') || 'Açıklama'}
            placeholderTextColor={Colors.paperDark}
            value={note}
            onChangeText={setNote}
          />

          <View style={styles.submitContainer}>
            <PrimaryButton
              title={t('addIncomeModal.submit')}
              icon="💵"
              onPress={handleSubmit}
              disabled={isSubmitting || !amount}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.inkLight,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  closeText: {
    fontSize: 22,
    color: Colors.paperDark,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xl,
    color: Colors.paper,
  },
  scrollContent: {
    padding: Spacing.xl,
  },
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.md,
    color: Colors.paper,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  chipsContainer: {
    gap: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inkLight,
    borderWidth: 1.5,
    borderColor: Colors.paperDark + '40',
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  chipIcon: {
    fontSize: 20,
    marginEnd: Spacing.sm,
  },
  chipText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.md,
    color: Colors.paperDark,
  },
  chipTextSelected: {
    color: Colors.white,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inkLight,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.sage,
  },
  currencySymbol: {
    fontFamily: Fonts.display,
    fontSize: 36,
    color: Colors.sage,
    marginEnd: Spacing.md,
  },
  amountInput: {
    flex: 1,
    fontFamily: Fonts.display,
    fontSize: 36,
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
    borderColor: Colors.paperDark + '40',
  },
  submitContainer: {
    marginTop: Spacing.xxl,
  },
});
