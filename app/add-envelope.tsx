/**
 * Add / Edit Envelope Modal — Zarfım
 * Modern minimalist tasarım, sıfır emoji, vektör ikon seçici
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
import { useEnvelopes } from '@/lib/hooks/useEnvelopes';
import { useSubscriptionStore } from '@/store/subscription';
import { queryClient } from '@/lib/queryClient';
import { getCurrencySymbol } from '@/lib/formatCurrency';

const PRESET_ICONS = [
  'cart-outline',
  'car-outline',
  'film-outline',
  'home-outline',
  'document-text-outline',
  'fast-food-outline',
  'airplane-outline',
  'medkit-outline',
  'gift-outline',
  'game-controller-outline',
  'cafe-outline',
  'book-outline',
  'shirt-outline',
  'fitness-outline',
];

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
  const [icon, setIcon] = useState(existingEnv?.icon || PRESET_ICONS[0]);
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
        'Ücretsiz Zarf Sınırı',
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
        <View style={styles.sheetHandle} />

        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={20} color={Colors.paper} />
          </Pressable>
          <Text style={styles.title}>
            {isEditing ? 'Zarfı Düzenle' : 'Yeni Zarf Oluştur'}
          </Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Zarf Adı */}
          <Text style={styles.label}>{t('addEnvelopeModal.name')}</Text>
          <TextInput
            style={styles.nameInput}
            placeholder={t('addEnvelopeModal.namePlaceholder')}
            placeholderTextColor="#64748B"
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
              placeholderTextColor="#64748B"
              keyboardType="decimal-pad"
              value={limit}
              onChangeText={setLimit}
            />
          </View>

          {/* İkon Seçimi */}
          <Text style={styles.label}>{t('addEnvelopeModal.icon')}</Text>
          <View style={styles.iconGrid}>
            {PRESET_ICONS.map((item) => {
              const isSelected = icon === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => setIcon(item)}
                  style={[
                    styles.iconOption,
                    isSelected && styles.iconOptionSelected,
                  ]}
                >
                  <AppIcon name={item} size={20} color={isSelected ? Colors.gold : '#94A3B8'} />
                </Pressable>
              );
            })}
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
                {color === c && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
              </Pressable>
            ))}
          </View>

          <View style={styles.submitContainer}>
            <PrimaryButton
              title={isEditing ? t('addEnvelopeModal.submitEdit') : t('addEnvelopeModal.submit')}
              icon={isEditing ? 'checkmark-outline' : 'add-outline'}
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
  nameInput: {
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
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.inkLight,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOptionSelected: {
    borderColor: Colors.gold,
    backgroundColor: 'rgba(201, 151, 58, 0.12)',
  },
  colorGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionSelected: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  submitContainer: {
    marginTop: Spacing.xxl,
  },
});
