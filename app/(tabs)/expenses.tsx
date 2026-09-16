import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors, Fonts, FontSizes, Spacing } from '@/lib/theme';
import { useEnvelopesStore } from '@/store/envelopes';
import { formatCurrency } from '@/lib/formatCurrency';
import PrimaryButton from '@/components/PrimaryButton';

export default function ExpensesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const transactions = useEnvelopesStore((s) => s.transactions);
  const envelopes = useEnvelopesStore((s) => s.envelopes);

  // Get current month transactions
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const currentMonthTransactions = transactions.filter(
    (tx) => new Date(tx.occurred_at).getTime() >= monthStart
  ).sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());

  const renderItem = ({ item }: { item: any }) => {
    const envelope = envelopes.find((e) => e.id === item.envelope_id);
    return (
      <View style={styles.expenseCard}>
        <View style={[styles.iconContainer, { backgroundColor: envelope?.color || Colors.ink }]}>
          <Text style={styles.icon}>{envelope?.icon || '🛒'}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.envelopeName}>{envelope?.name || 'Genel'}</Text>
          {item.note && <Text style={styles.note}>{item.note}</Text>}
          <Text style={styles.date}>
            {new Date(item.occurred_at).toLocaleDateString()}
          </Text>
        </View>
        <Text style={styles.amount}>-{formatCurrency(item.amount)}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('expenses.title')}</Text>
      </View>

      {currentMonthTransactions.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateIcon}>💸</Text>
          <Text style={styles.emptyStateTitle}>{t('expenses.noExpenses')}</Text>
        </View>
      ) : (
        <FlatList
          data={currentMonthTransactions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.footer}>
        <PrimaryButton
          title={t('dashboard.addExpense')}
          icon="✏️"
          onPress={() => router.push('/add-expense')}
          style={styles.addButton}
        />
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xxl,
    color: Colors.paper,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  expenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inkLight,
    padding: Spacing.md,
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
  envelopeName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.md,
    color: Colors.paper,
  },
  note: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.xs,
    color: Colors.paperDark,
    marginTop: 2,
  },
  date: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: Colors.paperDark,
    marginTop: 4,
  },
  amount: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes.lg,
    color: Colors.stamp,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyStateTitle: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes.lg,
    color: Colors.paper,
    textAlign: 'center',
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.inkLight,
  },
  addButton: {
    width: '100%',
  },
});
