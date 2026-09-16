/**
 * Gelirler Ekranı — Dashboard benzeri yapı
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
import { Colors, Fonts, FontSizes, Spacing } from '@/lib/theme';
import { useIncomes, useIncomeCategories } from '@/lib/hooks/useEnvelopes';
import { formatCurrency } from '@/lib/formatCurrency';
import PostmarkRing from '@/components/PostmarkRing';
import PrimaryButton from '@/components/PrimaryButton';
import SkeletonEnvelope from '@/components/SkeletonEnvelope';

export default function IncomesScreen() {
  const { t } = useTranslation();
  const { data: incomes = [], isLoading, isError } = useIncomes();
  const { data: categories = [] } = useIncomeCategories();
  const router = useRouter();

  // Calculate totals for PostmarkRing and SummaryRow
  const totalIncome = incomes.reduce((sum, item) => sum + Number(item.amount), 0);
  // Total expenses can be calculated if we want to show remaining here too, but this is the Income screen.
  // Maybe "totalBudget" is the target? Or we just show 100% of income is income. 
  // For the Ring, totalBudget = totalIncome, totalSpent = 0? Or maybe we don't show the ring, or show a full ring?
  // User asked: "bu sayfanın aynısından gelirler yapacaktın sadece."
  // Meaning we should have the PostmarkRing. We can use totalIncome as the "totalBudget" and totalIncome as "totalSpent" to fill it? 
  // Let's just make it show totalIncome and totalIncome for now to look like the screenshot.

  const currentMonth = new Date().toLocaleDateString(
    t('settings.languageName') === 'Türkçe' ? 'tr-TR' : 'ar-SA',
    { month: 'long', year: 'numeric' },
  );

  const renderItem = ({ item }: { item: any }) => {
    const category = categories.find((c) => c.id === item.category_id);
    return (
      <View style={styles.incomeCard}>
        <View style={[styles.iconContainer, { backgroundColor: category?.color || Colors.sage }]}>
          <Text style={styles.icon}>{category?.icon || '💰'}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.categoryName}>{category?.name || t('incomes.title')}</Text>
          {item.note && <Text style={styles.note}>{item.note}</Text>}
        </View>
        <Text style={styles.amount}>+{formatCurrency(item.amount)}</Text>
      </View>
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

            {/* Same Ring as dashboard */}
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
                <Text style={styles.summaryLabel}>Toplam Gelir ✏️</Text>
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
              <Text style={styles.sectionTitle}>Gelir Kalemlerim</Text>
              <Pressable onPress={() => router.push('/add-income-category' as any)}>
                <Text style={styles.addCategoryText}>{t('incomes.addCategory')}</Text>
              </Pressable>
            </View>
            
            {!isLoading && !isError && incomes.length === 0 && (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateIcon}>💸</Text>
                <Text style={styles.emptyStateTitle}>{t('incomes.noIncomes')}</Text>
                <Text style={styles.emptyStateDesc}>Henüz gelir eklemediniz.</Text>
              </View>
            )}
          </View>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <PrimaryButton
              title={t('incomes.addIncome')}
              icon="➕"
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
    color: Colors.paperDark,
    textTransform: 'capitalize',
  },
  loadingContainer: {
    paddingVertical: Spacing.md,
  },
  errorContainer: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.inkLight,
    borderRadius: 8,
    padding: Spacing.md,
  },
  errorText: {
    fontFamily: Fonts.body,
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
    borderRadius: 12,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
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
    fontFamily: Fonts.body,
    fontSize: FontSizes.xs,
    color: Colors.paperDark,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.paperDark,
    opacity: 0.3,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes.xl,
    color: Colors.paper,
  },
  addCategoryText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.sm,
    color: Colors.gold,
  },
  emptyStateContainer: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.xl,
    backgroundColor: Colors.paper,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.paperDark,
    borderStyle: 'dashed',
    marginBottom: Spacing.lg,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyStateTitle: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes.lg,
    color: Colors.ink,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptyStateDesc: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.sm,
    color: Colors.paperDark,
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
    backgroundColor: Colors.paper,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    borderRadius: 12,
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  infoContainer: {
    flex: 1,
  },
  categoryName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.md,
    color: Colors.ink,
  },
  note: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.xs,
    color: Colors.paperDark,
    marginTop: 2,
  },
  amount: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes.lg,
    color: Colors.sage,
  },
});
