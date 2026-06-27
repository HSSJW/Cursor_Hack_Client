// HospitalList — 거리/가용순 리스트
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colorDark } from '../theme/tokens';
import type { RootStackParamList } from '../types/hospital';
import type { Hospital } from '../types/hospital';
import { AppHeader, HospitalCard, Tag, ConfirmDialog } from '../components';
import { callPhone, openTmap } from '../lib/linking';
import { specialtyLabel, severityLabel, ageGroupLabel } from '../lib/specialtyLabel';

type Props = NativeStackScreenProps<RootStackParamList, 'HospitalList'>;

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

function formatUpdatedAgo(n: number): string {
  if (n === NO_REALTIME_DATA) return '실시간 정보 없음';
  if (n < 1) return '방금 전';
  return `${n}분 전`;
}

type DialogState = {
  visible: boolean;
  kind: 'call' | 'navi' | null;
  hospital: Hospital | null;
};

export default function HospitalList({ navigation, route }: Props) {
  const t = colorDark;
  const { result, symptom, severity } = route.params;
  const { ranked, excluded, estimated, region, generalNearby } = result;

  const [showGeneral, setShowGeneral] = useState(false);
  const [showExcluded, setShowExcluded] = useState(false);
  const [dialog, setDialog] = useState<DialogState>({
    visible: false,
    kind: null,
    hospital: null,
  });

  const hasGeneralToggle = !!(generalNearby && generalNearby.length > 0);
  const visibleHospitals = showGeneral && generalNearby ? generalNearby : ranked;

  const listTitle = hasGeneralToggle && !showGeneral
    ? `추천 병원 ${ranked.length}곳`
    : showGeneral
      ? `인근 응급실 ${visibleHospitals.length}곳`
      : `추천 병원 ${ranked.length}곳`;

  // 컨텍스트 스트립 태그 우선순위
  const contextTags: { label: string; kind: 'danger' | 'muted' }[] = [];
  if (estimated?.displayTags && estimated.displayTags.length > 0) {
    estimated.displayTags.slice(0, 3).forEach((tag, i) => {
      contextTags.push({ label: tag, kind: i === 0 ? 'danger' : 'muted' });
    });
    const ag = ageGroupLabel(estimated.ageGroup);
    if (ag) contextTags.push({ label: ag, kind: 'muted' });
  } else if (estimated?.requiredSpecialties && estimated.requiredSpecialties.length > 0) {
    estimated.requiredSpecialties.forEach((s) =>
      contextTags.push({ label: specialtyLabel(s), kind: 'danger' }),
    );
  } else {
    const sev = severityLabel(severity) ?? '';
    contextTags.push({ label: `${sev}${symptom}`, kind: 'danger' });
  }

  const openDialog = (kind: 'call' | 'navi', hospital: Hospital) => {
    setDialog({ visible: true, kind, hospital });
  };
  const closeDialog = () => setDialog((d) => ({ ...d, visible: false }));

  const confirmDialog = async () => {
    const { kind, hospital } = dialog;
    closeDialog();
    if (!hospital) return;
    if (kind === 'call') {
      if (hospital.phone) {
        await callPhone(hospital.phone);
      } else {
        Alert.alert('직통 번호 없음', '병원 직통 번호가 없습니다. 119로 연결할까요?', [
          { text: '취소', style: 'cancel' },
          { text: '119 연결', style: 'destructive', onPress: () => callPhone('119') },
        ]);
      }
    } else if (kind === 'navi') {
      if (hospital.lat != null && hospital.lon != null) {
        await openTmap(hospital.lat, hospital.lon, hospital.name);
      } else {
        Alert.alert('위치 정보 없음', '병원 좌표 정보가 없어 길찾기를 시작할 수 없습니다.');
      }
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.bgPage }]} edges={['top']}>
      <AppHeader
        t={t}
        onBack={() => navigation.goBack()}
        title={listTitle}
        titleSize="title"
        trailing={
          <View style={[styles.sortPill, { borderColor: t.border }]}>
            <Text style={[styles.sortText, { color: t.textSecondary }]}>거리순</Text>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* 컨텍스트 스트립 */}
        <View style={[styles.contextStrip, { backgroundColor: t.surface, borderColor: t.border }]}>
          <View style={styles.contextTags}>
            {contextTags.map((tag, i) => (
              <Tag key={i} t={t} kind={tag.kind}>
                {tag.label}
              </Tag>
            ))}
          </View>
          <View style={styles.contextMeta}>
            <Text style={[styles.regionText, { color: t.textSecondary }]}>
              {region.stage1} {region.stage2}
            </Text>
            <Text style={[styles.updatedText, { color: t.textTertiary }]}>방금 갱신</Text>
          </View>
        </View>

        {/* generalNearby 토글 */}
        {hasGeneralToggle && (
          <View style={styles.toggleRow}>
            <Pressable
              onPress={() => setShowGeneral(false)}
              style={[
                styles.toggleBtn,
                { borderColor: t.border },
                !showGeneral && { backgroundColor: t.infoBg, borderColor: t.infoBorder },
              ]}
            >
              <Text style={[styles.toggleText, { color: !showGeneral ? t.infoText : t.textSecondary }]}>
                특수병원 {ranked.length}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setShowGeneral(true)}
              style={[
                styles.toggleBtn,
                { borderColor: t.border },
                showGeneral && { backgroundColor: t.infoBg, borderColor: t.infoBorder },
              ]}
            >
              <Text style={[styles.toggleText, { color: showGeneral ? t.infoText : t.textSecondary }]}>
                인근 응급실 {generalNearby?.length ?? 0}
              </Text>
            </Pressable>
          </View>
        )}

        {/* 병원 카드 */}
        <View style={styles.cards}>
          {visibleHospitals.map((h, i) => (
            <HospitalCard
              key={h.hpid}
              t={t}
              rank={i + 1}
              name={h.name}
              distance={formatDistance(h.distanceKm)}
              eta={formatEta(h.etaMin)}
              updatedAgo={formatUpdatedAgo(h.updatedMinAgo)}
              available={h.erAvail}
              total={h.erTotal}
              trust={trustKind(h.trustScore)}
              confirm={h.trustScore >= 0.6 ? 'confirmed' : 'unconfirmed'}
              reason={h.reason ?? null}
              onPress={() => navigation.navigate('HospitalDetail', { hospital: h })}
              onCall={() => openDialog('call', h)}
              onNavi={() => openDialog('navi', h)}
            />
          ))}
        </View>

        {/* 수용 불가 목록 */}
        {excluded.length > 0 && (
          <View style={styles.excludedSection}>
            <Pressable onPress={() => setShowExcluded((v) => !v)}>
              <Text style={[styles.excludedToggle, { color: t.textSecondary }]}>
                {showExcluded ? '▾' : '▸'} 수용 불가 {excluded.length}곳 제외됨
              </Text>
            </Pressable>
            {showExcluded && (
              <View style={styles.excludedList}>
                {excluded.map((ex, i) => (
                  <View key={i} style={styles.excludedRow}>
                    <Text style={[styles.excludedName, { color: t.textSecondary }]}>{ex.name}</Text>
                    <Text style={[styles.excludedReason, { color: t.dangerText }]}>{ex.reason}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <ConfirmDialog
        t={t}
        visible={dialog.visible}
        kind={dialog.kind}
        hospital={
          dialog.hospital
            ? { name: dialog.hospital.name, distance: formatDistance(dialog.hospital.distanceKm) }
            : null
        }
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
    gap: 12,
  },
  sortPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  sortText: {
    fontSize: 12,
  },
  contextStrip: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  contextTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  contextMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  regionText: {
    fontSize: 12,
  },
  updatedText: {
    fontSize: 11,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cards: {
    gap: 10,
  },
  excludedSection: {
    gap: 8,
    marginTop: 4,
  },
  excludedToggle: {
    fontSize: 13,
    fontWeight: '500',
    paddingHorizontal: 4,
  },
  excludedList: {
    gap: 6,
    paddingHorizontal: 4,
  },
  excludedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  excludedName: {
    fontSize: 13,
    flex: 1,
  },
  excludedReason: {
    fontSize: 12,
  },
});
