/**
 * Dashboard (Bu Ay) — Ana ekran (i18n destekli)
 */
import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors, Fonts, FontSizes, Spacing } from '@/lib/theme';
import { useEnvelopes, useMonthlyStats } from '@/lib/hooks/useEnvelopes';
import { getMockEnvelopes, getMockMonthlySummary } from '@/lib/mockData';
import { formatCurrency } from '@/lib/formatCurrency';
import EnvelopeCard from '@/components/EnvelopeCard';
import PostmarkRing from '@/components/PostmarkRing';
import PrimaryButton from '@/components/PrimaryButton';
import LockedEnvelopeCard from '@/components/LockedEnvelopeCard';
import SkeletonEnvelope from '@/components/SkeletonEnvelope';
import { useAuthStore } from '@/store/auth';
import { useSubscriptionStore } from '@/store/subscription';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const { data: envelopes, isLoading, isError } = useEnvelopes();
  const stats = useMonthlyStats();
  const user = useAuthStore((s) => s.user);
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const router = useRouter();

  const mockEnvelopes = getMockEnvelopes();
  const mockSummary = getMockMonthlySummary();

  const displayEnvelopes = envelopes && envelopes.length > 0
    ? envelopes
    : mockEnvelopes;
  const totalBudget = envelopes && envelopes.length > 0
    ? stats.totalBudget
    : mockSummary.totalBudget;
  const totalSpent = envelopes && envelopes.length > 0
    ? stats.totalSpent
    : mockSummary.totalSpent;

  const currentMonth = new Date().toLocaleDateString(
    t('settings.languageName') === 'Türkçe' ? 'tr-TR' : 'ar-SA',
    { month: 'long', year: 'numeric' },
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={displayEnvelopes as any[]}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }) => <EnvelopeCard envelope={item as any} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{t('dashboard.title')}</Text>
              <Text style={styles.month}>{currentMonth}</Text>
            </View>

            {isLoading && (
              <View style={styles.loadingContainer}>
                <SkeletonEnvelope />
                <SkeletonEnvelope />
              </View>
            )}

            {isError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{t('dashboard.loadError')}</Text>
              </View>
            )}

            <PostmarkRing
              totalBudget={totalBudget}
              totalSpent={totalSpent}
            />

            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {formatCurrency(totalBudget)}
                </Text>
                <Text style={styles.summaryLabel}>{t('dashboard.totalBudget')}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {formatCurrency(totalSpent)}
                </Text>
                <Text style={styles.summaryLabel}>{t('dashboard.spent')}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text
                  style={[
                    styles.summaryValue,
                    {
                      color:
                        totalBudget - totalSpent >= 0
                          ? Colors.sage
                          : Colors.stamp,
                    },
                  ]}
                >
                  {formatCurrency(Math.abs(totalBudget - totalSpent))}
                </Text>
                <Text style={styles.summaryLabel}>
                  {totalBudget - totalSpent >= 0
                    ? t('dashboard.remaining')
                    : t('dashboard.over')}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>{t('dashboard.myEnvelopes')}</Text>
            
            {!isLoading && !isError && displayEnvelopes.length === 0 && (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateIcon}>✨</Text>
                <Text style={styles.emptyStateTitle}>{t('dashboard.emptyStateTitle')}</Text>
                <Text style={styles.emptyStateDesc}>{t('dashboard.emptyStateDesc')}</Text>
              </View>
            )}
          </View>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            {!isPremium && <LockedEnvelopeCard />}

            <PrimaryButton
              title={t('dashboard.addExpense')}
              icon="✏️"
              onPress={() => {
                console.log('Harcama Ekle tapped');
              }}
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
  sectionTitle: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes.xl,
    color: Colors.paper,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
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
});
