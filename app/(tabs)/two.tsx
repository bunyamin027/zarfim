/**
 * Raporlar Ekranı — Grafik ve İstatistikler (Victory Native XL + PDF/CSV Dışa Aktarma)
 */
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Pie, PolarChart } from 'victory-native';
import { CartesianChart, Line } from 'victory-native';

import { Colors, Fonts, FontSizes, Spacing, BorderRadius, Shadows } from '@/lib/theme';
import { useAuthStore } from '@/store/auth';
import { useSubscriptionStore } from '@/store/subscription';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { formatCurrency } from '@/lib/formatCurrency';
import PrimaryButton from '@/components/PrimaryButton';
import { isRTL } from '@/lib/i18n';

export default function ReportsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isPremium = useSubscriptionStore((s) => s.isPremium);

  const { data: transactions, isLoading } = useTransactions(isPremium);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);

  // Kategori Dağılımı Verisi (Donut)
  const pieData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const aggregated: Record<string, { value: number; color: string; label: string }> = {};

    transactions.forEach((tx) => {
      if (!aggregated[tx.envelope_id]) {
        aggregated[tx.envelope_id] = {
          value: 0,
          color: tx.envelope_color,
          label: tx.envelope_name_key ? t(tx.envelope_name_key) : tx.envelope_name,
        };
      }
      aggregated[tx.envelope_id].value += tx.amount;
    });

    return Object.values(aggregated);
  }, [transactions, t]);

  // Harcama Trendi Verisi (Çizgi Grafik - Günlük Harcamalar)
  const lineData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const dailyTotals: Record<string, number> = {};

    transactions.forEach((tx) => {
      const day = new Date(tx.date).toISOString().split('T')[0];
      dailyTotals[day] = (dailyTotals[day] || 0) + tx.amount;
    });

    const sortedDays = Object.keys(dailyTotals).sort();
    return sortedDays.map((day) => ({
      day,
      label: new Date(day).getDate().toString(),
      total: dailyTotals[day],
    }));
  }, [transactions]);

  // 📄 PDF Dışa Aktarma
  const handleExportPDF = async () => {
    if (!isPremium) {
      router.push('/paywall');
      return;
    }

    if (!transactions || transactions.length === 0) return;

    try {
      setIsExportingPdf(true);

      const totalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0);
      const isArabic = isRTL();

      const tableRows = transactions
        .map((tx) => {
          const dateStr = new Date(tx.date).toLocaleDateString(isArabic ? 'ar-SA' : 'tr-TR');
          const envelopeName = tx.envelope_name_key ? t(tx.envelope_name_key) : tx.envelope_name;
          const note = tx.note || '-';
          const amountStr = formatCurrency(tx.amount);
          return `
            <tr>
              <td>${dateStr}</td>
              <td>${envelopeName}</td>
              <td>${note}</td>
              <td style="font-weight: bold; color: #C1442D;">${amountStr}</td>
            </tr>
          `;
        })
        .join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html dir="${isArabic ? 'rtl' : 'ltr'}">
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; background-color: #ffffff; color: #1C2541; }
            .header { text-align: center; margin-bottom: 25px; border-bottom: 3px solid #C1442D; padding-bottom: 15px; }
            .title { font-size: 26px; margin: 0; color: #1C2541; }
            .subtitle { font-size: 14px; color: #6F8F6A; margin-top: 5px; }
            .summary-box { background-color: #EFE6D3; border-radius: 8px; padding: 15px 20px; margin-bottom: 25px; text-align: center; }
            .summary-title { font-size: 14px; color: #1C2541; }
            .summary-val { font-size: 24px; font-weight: bold; color: #C1442D; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background-color: #1C2541; color: #ffffff; text-align: ${isArabic ? 'right' : 'left'}; padding: 12px; font-size: 14px; }
            td { padding: 10px 12px; border-bottom: 1px solid #EFE6D3; font-size: 13px; text-align: ${isArabic ? 'right' : 'left'}; }
            tr:nth-child(even) { background-color: #F8F6F0; }
            .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #888888; border-top: 1px solid #eeeeee; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">📬 Zarfım — Harcama Raporu</h1>
            <div class="subtitle">${new Date().toLocaleDateString(isArabic ? 'ar-SA' : 'tr-TR', { month: 'long', year: 'numeric' })}</div>
          </div>
          <div class="summary-box">
            <div class="summary-title">${t('dashboard.spent')}</div>
            <div class="summary-val">${formatCurrency(totalSpent)}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Zarf</th>
                <th>Not / İşyeri</th>
                <th>Tutar</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <div class="footer">
            Zarfım Bütçe Uygulaması ile oluşturuldu • kahramanapp.com
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (isSharingAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: t('reports.exportPdf'),
          UTI: 'com.adobe.pdf',
        });
      }
    } catch (error) {
      console.error('Export PDF failed:', error);
      Alert.alert(t('common.error'), t('reports.exportErrorMsg'));
    } finally {
      setIsExportingPdf(false);
    }
  };

  // 📊 CSV Dışa Aktarma
  const handleExportCSV = async () => {
    if (!isPremium) {
      router.push('/paywall');
      return;
    }

    if (!transactions || transactions.length === 0) return;

    try {
      setIsExportingCsv(true);

      const header = 'Tarih,Zarf,Tutar,Not\n';
      const rows = transactions
        .map((tx) => {
          const dateStr = new Date(tx.date).toLocaleDateString();
          const envelopeName = tx.envelope_name_key ? t(tx.envelope_name_key) : tx.envelope_name;
          const note = tx.note || '';
          return `"${dateStr}","${envelopeName}","${tx.amount}","${note.replace(/"/g, '""')}"`;
        })
        .join('\n');

      const csvContent = header + rows;
      const fileName = `zarfim_export_${new Date().getTime()}.csv`;
      const filePath = (FileSystem as any).documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(filePath, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (isSharingAvailable) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'text/csv',
          dialogTitle: t('reports.exportCsv'),
          UTI: 'public.comma-separated-values-text',
        });
      }
    } catch (error) {
      console.error('Export CSV failed:', error);
      Alert.alert(t('common.error'), t('reports.exportErrorMsg'));
    } finally {
      setIsExportingCsv(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.subtitle}>{t('settings.notLoggedIn')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.stamp} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('reports.title')}</Text>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.emptyIcon}>✨</Text>
          <Text style={styles.emptyTitle}>{t('reports.noDataTitle')}</Text>
          <Text style={styles.emptySubtitle}>{t('reports.noDataDesc')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('reports.title')}</Text>
        </View>

        {!isPremium && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <View style={styles.warningTextContainer}>
              <Text style={styles.warningTitle}>{t('reports.freeLimitWarning')}</Text>
              <Text style={styles.warningDesc}>{t('reports.upgradeForMore')}</Text>
            </View>
          </View>
        )}

        {/* Kategori Dağılımı Grafiği */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('reports.chartCategory')}</Text>
          <View style={styles.pieChartContainer}>
            <PolarChart
              data={pieData}
              colorKey={"color"}
              valueKey={"value"}
              labelKey={"label"}
            >
              <Pie.Chart innerRadius={60} />
            </PolarChart>

            <View style={styles.pieCenterContent}>
              <Text style={styles.pieCenterText}>
                {formatCurrency(transactions.reduce((sum, tx) => sum + tx.amount, 0))}
              </Text>
            </View>
          </View>

          <View style={[styles.legendContainer, isRTL() && styles.rtlRow]}>
            {pieData.map((item, index) => (
              <View key={index} style={[styles.legendItem, isRTL() && styles.rtlRow]}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <Text style={styles.legendLabel}>{item.label}</Text>
                <Text style={styles.legendValue}>{formatCurrency(item.value)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Harcama Trendi Grafiği */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('reports.chartTrend')}</Text>
          <View style={[styles.lineChartContainer, isRTL() && styles.rtlChartFix]}>
            {lineData.length > 1 ? (
              <CartesianChart
                data={lineData}
                xKey="label"
                yKeys={["total"]}
                domainPadding={{ top: 20, bottom: 20, left: 20, right: 20 }}
                axisOptions={{
                  font: undefined,
                  tickCount: { x: Math.min(lineData.length, 5), y: 4 },
                  lineColor: Colors.paperDark,
                  labelColor: Colors.inkLight,
                }}
              >
                {({ points }) => (
                  <Line
                    points={points.total}
                    color={Colors.sage}
                    strokeWidth={3}
                    curveType="monotoneX"
                  />
                )}
              </CartesianChart>
            ) : (
              <View style={styles.notEnoughData}>
                <Text style={styles.subtitle}>Trend için daha fazla veriye ihtiyaç var.</Text>
              </View>
            )}
          </View>
        </View>

        {/* Dışa Aktarma Butonları */}
        <View style={styles.exportContainer}>
          <PrimaryButton
            title={isExportingPdf ? t('reports.exportingPdf') : t('reports.exportPdf')}
            icon={isExportingPdf ? '⏳' : isPremium ? '📄' : '🔒'}
            onPress={handleExportPDF}
            style={!isPremium ? styles.lockedButton : undefined}
          />
          <View style={{ height: Spacing.sm }} />
          <PrimaryButton
            title={isExportingCsv ? t('reports.exporting') : t('reports.exportCsv')}
            icon={isExportingCsv ? '⏳' : isPremium ? '📊' : '🔒'}
            onPress={handleExportCSV}
            style={!isPremium ? styles.lockedButton : { backgroundColor: Colors.inkLight }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ink,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xxl,
    color: Colors.paper,
  },
  loadingText: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.md,
    color: Colors.paperDark,
    marginTop: Spacing.md,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes.xl,
    color: Colors.paper,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.sm,
    color: Colors.paperDark,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '80%',
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.md,
    color: Colors.paperDark,
    textAlign: 'center',
  },
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.inkLight,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.gold,
  },
  warningIcon: {
    fontSize: 20,
    marginEnd: Spacing.sm,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.sm,
    color: Colors.paper,
  },
  warningDesc: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.xs,
    color: Colors.gold,
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.paper,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    ...Shadows.card,
  },
  cardTitle: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes.lg,
    color: Colors.ink,
    marginBottom: Spacing.lg,
  },
  pieChartContainer: {
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieCenterContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieCenterText: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSizes.lg,
    color: Colors.ink,
  },
  legendContainer: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.paperDark + '40',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginEnd: Spacing.sm,
    marginStart: Spacing.sm,
  },
  legendLabel: {
    flex: 1,
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.sm,
    color: Colors.inkLight,
    textAlign: 'left',
  },
  legendValue: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSizes.sm,
    color: Colors.ink,
  },
  lineChartContainer: {
    height: 220,
  },
  rtlChartFix: {
    transform: [{ scaleX: -1 }],
  },
  notEnoughData: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportContainer: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
  },
  lockedButton: {
    backgroundColor: Colors.inkLight,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
});
