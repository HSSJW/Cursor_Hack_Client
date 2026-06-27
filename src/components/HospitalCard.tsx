// HospitalCard — 리스트 카드
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { ColorTokens } from '../theme/tokens';
import TrustDot from './TrustDot';
import ConfirmBadge from './ConfirmBadge';
import Tag from './Tag';
import CTAButton from './CTAButton';

type TrustKind = 'success' | 'warning' | 'danger' | 'neutral';
type ConfirmStatus = 'confirmed' | 'unconfirmed';
type MatchStatus = 'confirmed' | 'unconfirmed' | null;

type Props = {
  t: ColorTokens;
  rank: number | string;
  name: string;
  distance: string;
  eta: string;
  updatedAgo: string;
  available: number | null;
  total: number | null;
  trust?: TrustKind;
  confirm?: ConfirmStatus;
  matchStatus?: MatchStatus;
  matchLabel?: string | null;
  reason?: string | null;
  onPress?: () => void;
  onCall?: () => void;
  onNavi?: () => void;
};

export default function HospitalCard({
  t,
  rank,
  name,
  distance,
  eta,
  updatedAgo,
  available,
  total,
  trust = 'success',
  confirm = 'confirmed',
  matchStatus = null,
  matchLabel = null,
  reason = null,
  onPress,
  onCall,
  onNavi,
}: Props) {
  const isUnknown = available == null || total == null;
  const avail = available ?? 0;
  const tot = total ?? 0;
  const ratio = tot > 0 ? Math.min(1, avail / tot) : 0;
  const isWarn = !isUnknown && (ratio < 0.3 || avail <= 1);

  const fillColor = isUnknown ? t.textTertiary : isWarn ? t.warningText : t.successText;
  const barWidth = isUnknown ? 0 : Math.max(8, ratio * 100);
  const countColor = isUnknown ? t.textTertiary : isWarn ? t.warningText : t.textPrimary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { borderColor: t.border, backgroundColor: pressed ? t.surfaceAlt : 'transparent' },
      ]}
    >
      {/* 상단행 */}
      <View style={styles.topRow}>
        <Text style={[styles.rank, { color: t.textTertiary }]}>{rank}</Text>
        <Text style={[styles.name, { color: t.textPrimary }]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={[styles.distance, { color: t.textPrimary }]}>{distance}</Text>
        <Text style={[styles.eta, { color: t.textSecondary }]}>· {eta}</Text>
      </View>

      {/* 메타행1 */}
      <View style={styles.metaRow}>
        <TrustDot t={t} kind={trust} />
        <Text style={[styles.meta, { color: t.textSecondary }]}>{updatedAgo}</Text>
        <Text style={[styles.meta, { color: t.textTertiary }]}>·</Text>
        <Text style={[styles.meta, { color: t.textSecondary }]}>응급실</Text>
        <View style={[styles.miniTrack, { backgroundColor: t.trackBg }]}>
          <View style={[styles.miniFill, { width: `${barWidth}%`, backgroundColor: fillColor }]} />
        </View>
        <Text style={[styles.availText, { color: countColor }]}>{isUnknown ? '?' : avail}</Text>
        <Text style={[styles.totalText, { color: t.textTertiary }]}>
          /{isUnknown ? '?' : tot}
        </Text>
      </View>

      {/* 메타행2 */}
      <View style={styles.metaRow2}>
        <ConfirmBadge t={t} status={confirm} />
        {matchLabel ? (
          confirm === 'confirmed' ? (
            <Tag t={t} kind="success">
              {matchLabel}
            </Tag>
          ) : (
            <Tag t={t} kind="muted">
              {`${matchLabel} · 확인 필요`}
            </Tag>
          )
        ) : null}
      </View>

      {reason ? (
        <Text style={[styles.reason, { color: t.textSecondary }]} numberOfLines={2}>
          {reason}
        </Text>
      ) : null}

      {/* 액션행 */}
      <View style={styles.actions}>
        <CTAButton t={t} variant="mini" onPress={onCall}>
          전화
        </CTAButton>
        <CTAButton t={t} variant="mini" onPress={onNavi}>
          길찾기
        </CTAButton>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 11,
    borderWidth: 1,
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  rank: {
    minWidth: 14,
    fontSize: 12,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  distance: {
    fontSize: 12,
    fontWeight: '500',
  },
  eta: {
    fontSize: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 22,
    flexWrap: 'wrap',
  },
  metaRow2: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 22,
    flexWrap: 'wrap',
  },
  meta: {
    fontSize: 12,
  },
  miniTrack: {
    width: 48,
    height: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  miniFill: {
    height: '100%',
    borderRadius: 999,
  },
  availText: {
    fontSize: 12,
    fontWeight: '500',
  },
  totalText: {
    fontSize: 12,
  },
  reason: {
    fontSize: 13,
    lineHeight: 18,
    paddingLeft: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
});
