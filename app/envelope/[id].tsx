/**
 * Envelope Detail Screen — Zarfım
 * Zarf detayı, harcama geçmişi, zarfı düzenleme ve silme.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Alert,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors, Fonts, FontSizes, Spacing, BorderRadius, Shadows } from '@/lib/theme';
import { useEnvelopes, useEnvelopeTransactions } from '@/lib/hooks/useEnvelopes';
import { useEnvelopesStore } from '@/store/envelopes';
import { formatCurrency } from '@/lib/formatCurrency';
import PrimaryButton from '@/components/PrimaryButton';
import { queryClient } from '@/lib/queryClient';

export default function EnvelopeDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: envelopes } = useEnvelopes();
  const envelope = envelopes?.find((e) => e.id === id);

  const { data: transactions, isLoading } = useEnvelopeTransactions(id || '');
  const { deleteEnvelope, deleteTransaction } = useEnvelopesStore();

  if (!envelope) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹ {t('common.back')}</Text>
          </Pressable>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.notFoundText}>Zarf bulunamadı.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const limit = envelope.monthly_limit;
  const spent = envelope.spent;
  const remaining = limit - spent;
  const isOver = spent > limit;
  const progress = Math.min(spent / limit, 1);

  const progressColor = isOver
    ? Colors.stamp
    : progress > 0.8
      ? '#E8963A'
      : Colors.sage;

  const handleDeleteEnvelope = () => {
    Alert.alert(
      t('common.delete'),
      t('envelopeDetail.deleteEnvelopeConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteEnvelope(envelope.id);
            await queryClient.invalidateQueries({ queryKey: ['envelopes'] });
            await queryClient.invalidateQueries({ queryKey: ['transactions'] });
            router.back();
          },
        },
      ]
    );
  };

  const handleDeleteTx = (txId: string) => {
    Alert.alert(
      t('common.delete'),
      t('envelopeDetail.deleteTransactionConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteTransaction(txId);
            await queryClient.invalidateQueries({ queryKey: ['envelopes'] });
            await queryClient.invalidateQueries({ queryKey: ['transactions'] });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>‹ {t('common.back')}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t('envelopeDetail.title')}</Text>
        <Pressable
          onPress={() => router.push({ pathname: '/add-envelope', params: { id: envelope.id } })}
          style={styles.editButton}
        >
          <Text style={styles.editText}>{t('common.edit')}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Zarf Kartı Tasarımı */}
        <View style={styles.envelopeCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.icon}>{envelope.icon}</Text>
            <View style={styles.cardHeaderInfo}>
              <Text style={styles.envelopeName}>{envelope.name}</Text>
              <Text style={styles.amountsText}>
                <Text style={{ color: progressColor, fontFamily: Fonts.bodyBold }}>
                  {formatCurrency(spent)}
                </Text>
                <Text style={{ color: Colors.inkLight }}> / {formatCurrency(limit)}</Text>
              </Text>
            </View>
          </View>

          {/* İlerleme Çubuğu */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress * 100}%`, backgroundColor: progressColor },
              ]}
            />
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.statusLabel}>
              {isOver ? t('envelope.over') : t('envelope.remaining')}
            </Text>
            <Text style={[styles.statusValue, { color: isOver ? Colors.stamp : Colors.sage }]}>
              {isOver ? '−' : ''}{formatCurrency(Math.abs(remaining))}
            </Text>
          </View>
        </View>

        {/* Aksiyon Butonları */}
        <View style={styles.actionsRow}>
          <PrimaryButton
            title={t('envelopeDetail.addExpenseForThis')}
            icon="💸"
            onPress={() =>
              router.push({ pathname: '/add-expense', params: { envelopeId: envelope.id } })
            }
            style={styles.addExpenseBtn}
          />
        </View>

        {/* İşlem Geçmişi */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{t('envelopeDetail.transactions')}</Text>
          <Pressable onPress={handleDeleteEnvelope}>
            <Text style={styles.deleteEnvelopeText}>{t('common.delete')}</Text>
          </Pressable>
        </View>

        {!transactions || transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyText}>{t('envelopeDetail.noTransactions')}</Text>
          </View>
        ) : (
          transactions.map((tx) => (
            <View key={tx.id} style={styles.txRow}>
              <View style={styles.txInfo}>
                <Text style={styles.txNote}>{tx.note || envelope.name}</Text>
                <Text style={styles.txDate}>
                  {new Date(tx.occurred_at || (tx as any).created_at).toLocaleDateString(undefined, {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <View style={styles.txRight}>
                <Text style={styles.txAmount}>−{formatCurrency(tx.amount)}</Text>
                <Pressable onPress={() => handleDeleteTx(tx.id)} style={styles.deleteTxBtn}>
                  <Text style={styles.deleteTxText}>✕</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
  backButton: {
    paddingVertical: Spacing.xs,
  },
  backText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.md,
    color: Colors.paper,
  },
  headerTitle: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.lg,
    color: Colors.paper,
  },
  editButton: {
    paddingVertical: Spacing.xs,
  },
  editText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.md,
    color: Colors.gold,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.md,
    color: Colors.paperDark,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  envelopeCard: {
    backgroundColor: Colors.paper,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 1.5,
    borderColor: Colors.paperDark,
    borderStyle: 'dashed',
    marginBottom: Spacing.xl,
    ...Shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  icon: {
    fontSize: 40,
    marginEnd: Spacing.md,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  envelopeName: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xxl,
    color: Colors.ink,
    marginBottom: Spacing.xs,
  },
  amountsText: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.md,
  },
  progressTrack: {
    height: 10,
    backgroundColor: Colors.paperDark,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.md,
    color: Colors.inkLight,
  },
  statusValue: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSizes.xl,
  },
  actionsRow: {
    marginBottom: Spacing.xl,
  },
  addExpenseBtn: {
    width: '100%',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes.xl,
    color: Colors.paper,
  },
  deleteEnvelopeText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.sm,
    color: Colors.stamp,
  },
  emptyState: {
    backgroundColor: Colors.inkLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.md,
    color: Colors.paperDark,
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.inkLight,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  txInfo: {
    flex: 1,
  },
  txNote: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.md,
    color: Colors.paper,
    marginBottom: 2,
  },
  txDate: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.xs,
    color: Colors.paperDark,
  },
  txRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  txAmount: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSizes.md,
    color: Colors.stamp,
  },
  deleteTxBtn: {
    padding: Spacing.xs,
  },
  deleteTxText: {
    fontSize: 16,
    color: Colors.paperDark,
  },
});
