/**
 * Add / Edit Envelope Modal — Zarfım
 * Zarf oluşturma ve düzenleme modalı.
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
import { Colors, Fonts, FontSizes, Spacing, BorderRadius } from '@/lib/theme';
import PrimaryButton from '@/components/PrimaryButton';
import { useEnvelopesStore } from '@/store/envelopes';
import { useEnvelopes } from '@/lib/hooks/useEnvelopes';
import { useSubscriptionStore } from '@/store/subscription';
import { queryClient } from '@/lib/queryClient';
import { getCurrencySymbol } from '@/lib/formatCurrency';

const PRESET_ICONS = ['🛒', '🚌', '🎬', '🏠', '📄', '🍕', '✈️', '💊', '🎁', '🎮', '☕', '🚗', '📚', '👕'];
const PRESET_COLORS = ['#6F8F6A', '#E8963A', '#C1442D', '#C9973A', '#2A3A5C', '#8E44AD', '#27AE60'];

export default function AddEnvelopeModal() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();

  const { data: envelopes } = useEnvelopes();
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const { addEnvelope, updateEnvelope } = useEnvelopesStore();

  const isEditing = !!params.id;
  const existingEnv = envelopes?.find((e) => e.id === params.id);

  const [name, setName] = useState(existingEnv?.name || '');
  const [limit, setLimit] = useState(existingEnv?.monthly_limit ? existingEnv.monthly_limit.toString() : '');
  const [icon, setIcon] = useState(existingEnv?.icon || '🛒');
  const [color, setColor] = useState(existingEnv?.color || PRESET_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const numericLimit = parseFloat(limit.replace(',', '.'));

    if (!name.trim() || isNaN(numericLimit) || numericLimit <= 0) {
      Alert.alert(t('common.error'), t('addEnvelopeModal.fillAll'));
      return;
    }

    // Freemium kontrolü — Yeni zarf eklenirken 3 zarf sınırı
    if (!isEditing && !isPremium && (envelopes?.length || 0) >= 3) {
      Alert.alert(
        t('addEnvelopeModal.limitReachedTitle'),
        t('addEnvelopeModal.limitReachedMsg'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('paywall.upgrade'),
            onPress: () => {
              router.back();
              router.push('/paywall');
            },
          },
        ]
      );
      return;
    }

    try {
      setIsSubmitting(true);

      if (isEditing && params.id) {
        await updateEnvelope(params.id, {
          name: name.trim(),
          monthly_limit: numericLimit,
          icon,
          color,
        });
      } else {
        await addEnvelope({
          name: name.trim(),
          monthly_limit: numericLimit,
          icon,
          color,
          is_recurring: true,
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['envelopes'] });
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
          <Text style={styles.title}>
            {isEditing ? t('addEnvelopeModal.editTitle') : t('addEnvelopeModal.title')}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Zarf Adı */}
          <Text style={styles.label}>{t('addEnvelopeModal.name')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('addEnvelopeModal.namePlaceholder')}
            placeholderTextColor={Colors.paperDark}
            value={name}
            onChangeText={setName}
            autoFocus={!isEditing}
          />

          {/* Aylık Limit */}
          <Text style={styles.label}>{t('addEnvelopeModal.limit')}</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>{getCurrencySymbol()}</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor={Colors.paperDark}
              keyboardType="decimal-pad"
              value={limit}
              onChangeText={setLimit}
            />
          </View>

          {/* İkon Seçimi */}
          <Text style={styles.label}>{t('addEnvelopeModal.icon')}</Text>
          <View style={styles.iconGrid}>
            {PRESET_ICONS.map((item) => (
              <Pressable
                key={item}
                onPress={() => setIcon(item)}
                style={[
                  styles.iconOption,
                  icon === item && styles.iconOptionSelected,
                ]}
              >
                <Text style={styles.iconText}>{item}</Text>
              </Pressable>
            ))}
          </View>

          {/* Renk Seçimi */}
          <Text style={styles.label}>{t('addEnvelopeModal.color')}</Text>
          <View style={styles.colorGrid}>
            {PRESET_COLORS.map((c) => (
              <Pressable
                key={c}
                onPress={() => setColor(c)}
                style={[
                  styles.colorOption,
                  { backgroundColor: c },
                  color === c && styles.colorOptionSelected,
                ]}
              >
                {color === c && <Text style={styles.checkmark}>✓</Text>}
              </Pressable>
            ))}
          </View>

          <View style={styles.submitContainer}>
            <PrimaryButton
              title={isEditing ? t('addEnvelopeModal.submitEdit') : t('addEnvelopeModal.submit')}
              icon={isEditing ? '💾' : '✉️'}
              onPress={handleSubmit}
              disabled={isSubmitting || !name || !limit}
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
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  input: {
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
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inkLight,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.gold,
  },
  currencySymbol: {
    fontFamily: Fonts.display,
    fontSize: 28,
    color: Colors.gold,
    marginEnd: Spacing.md,
  },
  amountInput: {
    flex: 1,
    fontFamily: Fonts.display,
    fontSize: 28,
    color: Colors.paper,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.inkLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.paperDark + '30',
  },
  iconOptionSelected: {
    borderColor: Colors.gold,
    backgroundColor: Colors.gold + '30',
  },
  iconText: {
    fontSize: 24,
  },
  colorGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: Colors.paper,
  },
  checkmark: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitContainer: {
    marginTop: Spacing.xxl,
  },
});
