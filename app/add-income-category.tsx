/**
 * Add Income Category Modal — Zarfım
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
import { queryClient } from '@/lib/queryClient';

const PRESET_ICONS = ['💰', '💳', '🏢', '📈', '🎁', '🏦', '📱', '🚗'];
const PRESET_COLORS = ['#6F8F6A', '#E8963A', '#C1442D', '#C9973A', '#2A3A5C', '#8E44AD', '#27AE60'];

export default function AddIncomeCategoryModal() {
  const { t } = useTranslation();
  const router = useRouter();

  const addIncomeCategory = useEnvelopesStore((s) => s.addIncomeCategory);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('💰');
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
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
          <Text style={styles.title}>{t('addIncomeCategoryModal.title')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Kategori Adı */}
          <Text style={styles.label}>{t('addIncomeCategoryModal.name')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('addIncomeCategoryModal.namePlaceholder')}
            placeholderTextColor={Colors.paperDark}
            value={name}
            onChangeText={setName}
            autoFocus
          />

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
              title={t('addIncomeCategoryModal.submit')}
              icon="💵"
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
    borderColor: Colors.sage,
    backgroundColor: Colors.sage + '30',
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
