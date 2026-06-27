// HospitalDetail — 병상/장비/수용/CTA
import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colorDark } from '../theme/tokens';
import type { RootStackParamList } from '../types/hospital';
import {
  AppHeader,
  TrustDot,
  ConfirmBadge,
  BedStatusRow,
  Tag,
  CTAButton,
  SectionLabel,
  ConfirmDialog,
} from '../components';
import { callPhone, openTmap } from '../lib/linking';
import { mkioskLabel, mkioskMsgLabel } from '../lib/mkioskCatalog';

type Props = NativeStackScreenProps<RootStackParamList, 'HospitalDetail'>;

const NO_REALTIME_DATA = 999_999;

type TrustKind = 'success' | 'warning' | 'danger' | 'neutral';

function trustKind(score: number): TrustKind {
  if (score >= 0.8) return 'success';
  if (score >= 0.4) return 'warning';
  if (score > 0) return 'danger';
  return 'neutral';
}

function formatDistance(km?: number): string {
  return km != null ? `${km.toFixed(1)}km` : '-';
}

function formatEta(min?: number): string {
  return min != null ? `${min}분` : '-';
}

export default function HospitalDetail({ navigation, route }: Props) {
  const t = colorDark;
  const { hospital: h } = route.params;

  const [dialog, setDialog] = useState<{ visible: boolean; kind: 'call' | 'navi' | null }>({
    visible: false,
    kind: null,
  });

  const updatedStr =
    h.updatedMinAgo === NO_REALTIME_DATA || h.updatedMinAgo == null
      ? '실시간 정보 없음 — 전화로 확인'
      : `${h.updatedMinAgo}분 전`;

  const equipItems: { label: string; available: boolean }[] = [
    { label: 'CT', available: h.equip.ct },
    { label: 'MRI', available: h.equip.mri },
    { label: '혈관조영', available: h.equip.angio },
  ];

  const acceptEntries = Object.entries(h.accept);
  const msgEntries = Object.entries(h.acceptMsgs).filter(([, msg]) => msg !== '.');

  const openDialog = (kind: 'call' | 'navi') => setDialog({ visible: true, kind });
  const closeDialog = () => setDialog((d) => ({ ...d, visible: false }));

  const confirmDialog = async () => {
    const { kind } = dialog;
    closeDialog();
    if (kind === 'call') {
      if (h.phone) {
        await callPhone(h.phone);
      } else {
        Alert.alert('직통 번호 없음', '병원 직통 번호가 없습니다. 119로 연결할까요?', [
          { text: '취소', style: 'cancel' },
          { text: '119 연결', style: 'destructive', onPress: () => callPhone('119') },
        ]);
      }
    } else if (kind === 'navi') {
      if (h.lat != null && h.lon != null) {
        await openTmap(h.lat, h.lon, h.name);
      } else {
        Alert.alert('위치 정보 없음', '병원 좌표 정보가 없어 길찾기를 시작할 수 없습니다.');
      }
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.bgPage }]} edges={['top']}>
      <AppHeader t={t} onBack={() => navigation.goBack()} title={h.name} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* 메타행 */}
        <View style={styles.metaRow}>
          <TrustDot t={t} kind={trustKind(h.trustScore)} />
          <Text style={[styles.metaText, { color: t.textSecondary }]}>
            {updatedStr} 갱신 · {formatDistance(h.distanceKm)} · {formatEta(h.etaMin)}
          </Text>
          <ConfirmBadge t={t} status={h.trustScore >= 0.6 ? 'confirmed' : 'unconfirmed'} />
        </View>

        {/* 병상 현황 */}
        <View style={styles.section}>
          <SectionLabel t={t}>병상 현황 (가용/전체)</SectionLabel>
          <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
            <BedStatusRow t={t} label="응급실" available={h.erAvail} total={h.erTotal} />
            {h.beds.map((b, i) => (
              <View key={i}>
                <View style={[styles.divider, { backgroundColor: t.border }]} />
                <BedStatusRow t={t} label={b.label} available={b.avail} total={b.total} />
              </View>
            ))}
          </View>
        </View>

        {/* 장비 · 중증 수용 */}
        <View style={styles.section}>
          <SectionLabel t={t}>장비 · 중증 수용</SectionLabel>
          <View style={styles.tagWrap}>
            {equipItems.map((e) =>
              e.available ? (
                <Tag key={e.label} t={t} kind="success">
                  {e.label}
                </Tag>
              ) : (
                <Tag key={e.label} t={t} kind="muted">
                  {`${e.label} · 미가용`}
                </Tag>
              ),
            )}
            {acceptEntries.map(([key, val]) => {
              const label = mkioskLabel(key);
              if (val === 'Y') {
                return (
                  <Tag key={key} t={t} kind="success">
                    {label}
                  </Tag>
                );
              }
              const suffix = val === 'N' ? ' · 수용불가' : ' · 정보 없음';
              return (
                <Tag key={key} t={t} kind="muted">
                  {`${label}${suffix}`}
                </Tag>
              );
            })}
          </View>
        </View>

        {/* AI 추천 근거 */}
        {h.reason ? (
          <View style={styles.section}>
            <SectionLabel t={t}>AI 추천 근거</SectionLabel>
            <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
              <Text style={[styles.reasonText, { color: t.textPrimary }]}>{h.reason}</Text>
            </View>
          </View>
        ) : null}

        {/* 안내 메시지 */}
        {msgEntries.length > 0 && (
          <View style={styles.section}>
            <SectionLabel t={t}>안내 메시지</SectionLabel>
            <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
              {msgEntries.map(([key, msg]) => (
                <Text key={key} style={[styles.msgText, { color: t.textSecondary }]}>
                  • {mkioskMsgLabel(key)}: {msg}
                </Text>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.ctaRow}>
          <CTAButton t={t} variant="primary" onPress={() => openDialog('call')} style={styles.cta}>
            전화 연결
          </CTAButton>
          <CTAButton t={t} variant="secondary" onPress={() => openDialog('navi')} style={styles.cta}>
            길찾기
          </CTAButton>
        </View>
        <Text style={[styles.hint, { color: t.textTertiary }]}>
          최종 수용 여부는 통화로 확인하세요
        </Text>
      </View>

      <ConfirmDialog
        t={t}
        visible={dialog.visible}
        kind={dialog.kind}
        hospital={{ name: h.name, distance: formatDistance(h.distanceKm) }}
        onCancel={closeDialog}
        onConfirm={confirmDialog}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  metaText: {
    flex: 1,
    fontSize: 13,
  },
  section: {
    gap: 8,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  reasonText: {
    fontSize: 14,
    lineHeight: 20,
  },
  msgText: {
    fontSize: 13,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cta: {
    flex: 1,
  },
  hint: {
    fontSize: 12,
    textAlign: 'center',
  },
});
