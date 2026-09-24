/**
 * Add Income Category Modal — Zarfım
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
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, BorderRadius } from '@/lib/theme';
import PrimaryButton from '@/components/PrimaryButton';
import AppIcon from '@/components/AppIcon';
import { useEnvelopesStore } from '@/store/envelopes';
import { queryClient } from '@/lib/queryClient';

const PRESET_ICONS = [
  'wallet-outline',
  'card-outline',
  'business-outline',
  'trending-up-outline',
  'gift-outline',
  'library-outline',
  'phone-portrait-outline',
  'car-outline',
];

const PRESET_COLORS = ['#6F8F6A', '#E8963A', '#C1442D', '#C9973A', '#2A3A5C', '#8E44AD', '#27AE60'];

export default function AddIncomeCategoryModal() {
  const { t } = useTranslation();
  const router = useRouter();

  const addIncomeCategory = useEnvelopesStore((s) => s.addIncomeCategory);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState(PRESET_ICONS[0]);
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('addIncomeModal.fillAll'));
      return;
    }

    try {
      setIsSubmitting(true);
      await addIncomeCategory({
        name: name.trim(),
        icon,
        color,
      });

      await queryClient.invalidateQueries({ queryKey: ['incomeCategories'] });
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
          <Text style={styles.title}>{t('addIncomeCategoryModal.title')}</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Kategori Adı */}
          <Text style={styles.label}>{t('addIncomeCategoryModal.name')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('addIncomeCategoryModal.namePlaceholder')}
            placeholderTextColor="#64748B"
            value={name}
            onChangeText={setName}
            autoFocus
          />

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
              title={t('addIncomeCategoryModal.submit')}
              icon="add-outline"
              onPress={handleSubmit}
              disabled={isSubmitting || !name}
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
  input: {
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
