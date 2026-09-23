/**
 * Gelirler Ekranı — Zarfım
 * Modern minimalist tasarım, swipe-to-delete, sıfır emoji
 */
import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors, Fonts, FontSizes, Spacing, BorderRadius } from '@/lib/theme';
import { useIncomes, useIncomeCategories } from '@/lib/hooks/useEnvelopes';
import { useEnvelopesStore } from '@/store/envelopes';
import { formatCurrency } from '@/lib/formatCurrency';
import PostmarkRing from '@/components/PostmarkRing';
import PrimaryButton from '@/components/PrimaryButton';
import SkeletonEnvelope from '@/components/SkeletonEnvelope';
import SwipeableItem from '@/components/SwipeableItem';
import AppIcon from '@/components/AppIcon';
import { queryClient } from '@/lib/queryClient';

export default function IncomesScreen() {
  const { t } = useTranslation();
  const { data: incomes = [], isLoading, isError } = useIncomes();
  const { data: categories = [] } = useIncomeCategories();
  const deleteIncome = useEnvelopesStore((s) => s.deleteIncome);
  const router = useRouter();

  const totalIncome = incomes.reduce((sum, item) => sum + Number(item.amount), 0);

  const currentMonth = new Date().toLocaleDateString(
    t('settings.languageName') === 'Türkçe' ? 'tr-TR' : 'ar-SA',
    { month: 'long', year: 'numeric' },
  );

  const handleDeleteIncome = async (id: string) => {
    await deleteIncome(id);
    await queryClient.invalidateQueries({ queryKey: ['incomes'] });
  };

  const renderItem = ({ item }: { item: any }) => {
    const category = categories.find((c) => c.id === item.category_id);
    return (
      <SwipeableItem
        onDelete={() => handleDeleteIncome(item.id)}
        style={{ marginHorizontal: Spacing.lg }}
      >
        <View style={styles.incomeCard}>
          <View style={[styles.iconContainer, { backgroundColor: category?.color || Colors.sage }]}>
            <AppIcon name={category?.icon || 'wallet-outline'} size={20} color="#FFFFFF" />
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.categoryName}>{category?.name || t('incomes.title')}</Text>
            {item.note && <Text style={styles.note}>{item.note}</Text>}
          </View>
          <Text style={styles.amount}>+{formatCurrency(item.amount)}</Text>
        </View>
      </SwipeableItem>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={incomes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{t('incomes.title')}</Text>
              <Text style={styles.month}>{currentMonth}</Text>
            </View>

            {isLoading && (
              <View style={styles.loadingContainer}>
                <SkeletonEnvelope />
              </View>
            )}

            {isError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{t('dashboard.loadError')}</Text>
              </View>
            )}

            <PostmarkRing
              totalBudget={totalIncome > 0 ? totalIncome : 100}
              totalSpent={totalIncome}
            />

            <View style={styles.summaryRow}>
              <Pressable
                style={styles.summaryItem}
                onPress={() => router.push('/add-income-category' as any)}
              >
                <Text style={styles.summaryValue}>
                  {formatCurrency(totalIncome)}
                </Text>
                <Text style={styles.summaryLabel}>Toplam Gelir</Text>
              </Pressable>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {incomes.length}
                </Text>
                <Text style={styles.summaryLabel}>İşlem Sayısı</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text
                  style={[
                    styles.summaryValue,
                    { color: Colors.sage },
                  ]}
                >
                  {formatCurrency(totalIncome)}
                </Text>
                <Text style={styles.summaryLabel}>Net Gelir</Text>
              </View>
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Gelir Kalemleri</Text>
              <Pressable onPress={() => router.push('/add-income-category' as any)}>
                <Text style={styles.addCategoryText}>{t('incomes.addCategory')}</Text>
              </Pressable>
            </View>

            {!isLoading && !isError && incomes.length === 0 && (
              <View style={styles.emptyStateContainer}>
                <AppIcon name="wallet-outline" size={32} color={Colors.sage} />
                <Text style={styles.emptyStateTitle}>{t('incomes.noIncomes')}</Text>
                <Text style={styles.emptyStateDesc}>
                  Gelirlerinizi takip etmek için harcama öncesi bütçenizi girin.
                </Text>
              </View>
            )}
          </View>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <PrimaryButton
              title={t('incomes.addIncome')}
              icon="add-outline"
              onPress={() => router.push('/add-income' as any)}
              style={styles.addButton}
            />
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ink,
  },
  listContent: {
    paddingBottom: Spacing.xxxl,
  },
  header: {
    paddingTop: Spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xxl,
    color: Colors.paper,
  },
  month: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.sm,
    color: '#8E8E93',
    textTransform: 'capitalize',
  },
  loadingContainer: {
    paddingVertical: Spacing.md,
  },
  errorContainer: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.inkLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  errorText: {
    fontFamily: Fonts.bodyLight,
    fontSize: FontSizes.sm,
    color: Colors.gold,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    backgroundColor: Colors.inkLight,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.md,
    color: Colors.paper,
  },
  summaryLabel: {
    fontFamily: Fonts.bodyLight,
    fontSize: FontSizes.xs,
    color: '#8E8E93',
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.lg,
    color: Colors.paper,
  },
  addCategoryText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.sm,
    color: Colors.gold,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  emptyStateTitle: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.lg,
    color: Colors.paper,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptyStateDesc: {
    fontFamily: Fonts.bodyLight,
    fontSize: FontSizes.sm,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    alignItems: 'center',
  },
  addButton: {
    width: '100%',
  },
  incomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inkLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  infoContainer: {
    flex: 1,
  },
  categoryName: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.md,
    color: Colors.paper,
  },
  note: {
    fontFamily: Fonts.bodyLight,
    fontSize: FontSizes.xs,
    color: '#8E8E93',
    marginTop: 2,
  },
  amount: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.md,
    color: Colors.sage,
  },
});
