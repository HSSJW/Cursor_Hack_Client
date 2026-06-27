// BedStatusRow — 라벨 + 게이지 + 수치
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ColorTokens } from '../theme/tokens';

type Props = {
  t: ColorTokens;
  label: string;
  available: number | null;
  total: number | null;
};

export default function BedStatusRow({ t, label, available, total }: Props) {
  const isUnknown = available == null || total == null;
  const avail = available ?? 0;
  const tot = total ?? 0;
  const ratio = tot > 0 ? avail / tot : 0;
  const isWarn = !isUnknown && (ratio < 0.3 || avail <= 1);

  const fillColor = isUnknown
    ? t.textTertiary
    : isWarn
      ? t.warningText
      : t.successText;
  const barWidth = isUnknown ? 0 : Math.max(6, ratio * 100);

  const availDisplay = isUnknown ? '?' : String(avail);
  const countColor = isUnknown ? t.textTertiary : isWarn ? t.warningText : t.textPrimary;

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: t.textSecondary }]}>{label}</Text>
      <View style={[styles.track, { backgroundColor: t.trackBg }]}>
        <View style={[styles.fill, { width: `${barWidth}%`, backgroundColor: fillColor }]} />
      </View>
      <View style={styles.counts}>
        <Text style={[styles.availText, { color: countColor }]}>{availDisplay}</Text>
        <Text style={[styles.totalText, { color: t.textTertiary }]}>
          {isUnknown ? '/?' : `/${tot}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  label: {
    width: 70,
    fontSize: 13,
  },
  track: {
    width: 80,
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  counts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginLeft: 'auto',
  },
  availText: {
    fontSize: 13,
    fontWeight: '500',
  },
  totalText: {
    fontSize: 13,
  },
});
