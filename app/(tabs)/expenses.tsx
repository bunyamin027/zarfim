import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors, Fonts, FontSizes, Spacing, BorderRadius } from '@/lib/theme';
import { useEnvelopesStore } from '@/store/envelopes';
import { formatCurrency } from '@/lib/formatCurrency';
import PrimaryButton from '@/components/PrimaryButton';
import SwipeableItem from '@/components/SwipeableItem';
import AppIcon from '@/components/AppIcon';
import { queryClient } from '@/lib/queryClient';

export default function ExpensesScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const transactions = useEnvelopesStore((s) => s.transactions);
  const envelopes = useEnvelopesStore((s) => s.envelopes);
  const deleteTransaction = useEnvelopesStore((s) => s.deleteTransaction);

  // Get current month transactions
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const currentMonthTransactions = transactions.filter(
    (tx) => new Date(tx.occurred_at).getTime() >= monthStart
  ).sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());

  const handleDeleteExpense = async (id: string) => {
    await deleteTransaction(id);
    await queryClient.invalidateQueries({ queryKey: ['transactions'] });
    await queryClient.invalidateQueries({ queryKey: ['envelopes'] });
    await queryClient.invalidateQueries({ queryKey: ['incomes'] });
  };

  const renderItem = ({ item }: { item: any }) => {
    const envelope = envelopes.find((e) => e.id === item.envelope_id);
    return (
      <SwipeableItem
        onDelete={() => handleDeleteExpense(item.id)}
        style={{ marginHorizontal: Spacing.lg }}
      >
        <View style={styles.expenseCard}>
          <View style={[styles.iconContainer, { backgroundColor: envelope?.color || Colors.inkLight }]}>
            <AppIcon name={envelope?.icon || 'cart-outline'} size={18} color="#FFFFFF" />
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.envelopeName}>{(envelope as any)?.nameKey ? t((envelope as any).nameKey) : envelope?.name || t('envelope.general')}</Text>
            {item.note && <Text style={styles.note}>{item.note}</Text>}
            <Text style={styles.date}>
              {new Date(item.occurred_at).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : i18n.language === 'en' ? 'en-US' : 'tr-TR')}
            </Text>
          </View>
          <Text style={styles.amount}>−{formatCurrency(item.amount)}</Text>
        </View>
      </SwipeableItem>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('expenses.title')}</Text>
      </View>

      {currentMonthTransactions.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <AppIcon name="arrow-up-circle-outline" size={40} color={Colors.stamp} />
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
          icon="pencil-outline"
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
    paddingBottom: Spacing.xxxl,
  },
  expenseCard: {
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
  envelopeName: {
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
  date: {
    fontFamily: Fonts.bodyLight,
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 3,
  },
  amount: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.md,
    color: Colors.stamp,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyStateTitle: {
    fontFamily: Fonts.bodyLight,
    fontSize: FontSizes.md,
    color: '#8E8E93',
    textAlign: 'center',
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  addButton: {
    width: '100%',
  },
});
