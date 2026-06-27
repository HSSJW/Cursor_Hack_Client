// Loading — 파이프라인 진행 + 실제 API 호출
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colorDark } from '../theme/tokens';
import type { RootStackParamList } from '../types/hospital';
import { LoadingStep, Callout } from '../components';
import type { SubStep } from '../components';
import { getCurrentLocation } from '../lib/location';
import { recommendHospitals } from '../lib/api';
import type { EstimatedContext } from '../lib/api';
import { getSessionId } from '../lib/session';
import { ageGroupLabel, severityLabel, specialtyLabel } from '../lib/specialtyLabel';

type Props = NativeStackScreenProps<RootStackParamList, 'Loading'>;

type StepStatus = 'pending' | 'progress' | 'done';

const STEP_LABELS: Record<number, string> = {
  0: '환자 상태 분석',
  1: '현재 위치 확인',
  2: '가용 병상 조회',
  3: '중증 질환 수용 확인',
  4: '최적 병원 분석',
};

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function severityWord(severity?: string): string {
  return severity === 'severe' ? '중증' : '일반';
}

/** 환자 상태 분석 단계의 결과 요약 (예: "소아 / 수지접합"). */
function describeIntent(estimated?: EstimatedContext | null, severity?: string): string {
  const e = estimated;
  if (e?.displayTags && e.displayTags.length > 0) {
    return e.displayTags.slice(0, 3).join(' / ');
  }
  const parts: string[] = [];
  const age = ageGroupLabel(e?.ageGroup);
  if (age) parts.push(age);
  if (e?.requiredSpecialties && e.requiredSpecialties.length > 0) {
    parts.push(...e.requiredSpecialties.slice(0, 2).map(specialtyLabel));
  }
  if (parts.length > 0) return parts.join(' / ');
  const sev = severityLabel(e?.severity ?? severity);
  if (e?.symptom) return [sev, e.symptom].filter(Boolean).join(' · ');
  return '증상 분석 완료';
}

export default function Loading({ navigation, route }: Props) {
  const t = colorDark;
  const { symptom, severity, rawQuery, sessionId: paramSessionId } = route.params;

  const hasIntentStep = !!rawQuery;
  const visibleSteps = hasIntentStep ? [0, 1, 2, 3, 4] : [1, 2, 3, 4];

  const [status, setStatus] = useState<Record<number, StepStatus>>(() => {
    const init: Record<number, StepStatus> = {};
    visibleSteps.forEach((s) => (init[s] = 'pending'));
    return init;
  });
  const [subs, setSubs] = useState<Record<number, SubStep[]>>({});

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    let cancelled = false;

    const setStep = (id: number, s: StepStatus) => {
      if (cancelled || !isMounted.current) return;
      setStatus((prev) => ({ ...prev, [id]: s }));
    };
    const setSub = (id: number, value: SubStep[]) => {
      if (cancelled || !isMounted.current) return;
      setSubs((prev) => ({ ...prev, [id]: value }));
    };

    const run = async () => {
      try {
        const sid = paramSessionId ?? (await getSessionId());

        // 단계0: 환자 상태 분석 (LLM 의도추출 — 결과는 서버 응답 후 채움)
        if (hasIntentStep) {
          setStep(0, 'progress');
          setSub(0, [{ text: '증상·중증도 분석 중…', status: 'progress' }]);
        }

        // 단계1: 위치 — GPS는 클라에서 즉시 확보 → 좌표 먼저 표시
        setStep(1, 'progress');
        const loc = await getCurrentLocation();
        setSub(1, [
          { text: `좌표 ${loc.lat.toFixed(4)}, ${loc.lon.toFixed(4)}`, status: 'done' },
        ]);
        setStep(1, 'done');

        // 서버 호출 시작 (단일 응답 — 단계 2~4 결과는 여기서 한 번에 옴)
        const responsePromise = recommendHospitals({
          lat: loc.lat,
          lon: loc.lon,
          symptom,
          severity,
          rawQuery,
          sessionId: sid,
        });

        // 단계2: 가용 병상 조회 진행 표시 (응답 대기)
        setStep(2, 'progress');
        setSub(2, [{ text: '실시간 가용 병상 조회 중…', status: 'progress' }]);

        // 응답 대기 + 최소 노출 시간 확보
        const [result] = await Promise.all([responsePromise, sleep(700)]);
        if (cancelled || !isMounted.current) return;

        // 단계0 결과: 추출된 환자 상태 (예: "소아 / 수지접합")
        if (hasIntentStep) {
          setSub(0, [{ text: describeIntent(result.estimated, severity), status: 'done' }]);
          setStep(0, 'done');
        }

        // 단계1 결과: 좌표 → 행정구역으로 갱신
        const regionText = `${result.region?.stage1 ?? ''} ${result.region?.stage2 ?? ''}`.trim();
        if (regionText) {
          setSub(1, [{ text: regionText, status: 'done' }]);
        }

        // 단계2 결과: 조회된 응급의료기관 수
        const queried =
          (result.ranked?.length ?? 0) +
          (result.excluded?.length ?? 0) +
          (result.generalNearby?.length ?? 0);
        setSub(2, [{ text: `응급의료기관 ${queried}곳 조회 완료`, status: 'done' }]);
        setStep(2, 'done');
        await sleep(450);
        if (cancelled || !isMounted.current) return;

        // 단계3: 중증 질환 수용 확인
        setStep(3, 'progress');
        setSub(3, [{ text: '수용 가능 여부 확인 중…', status: 'progress' }]);
        await sleep(450);
        if (cancelled || !isMounted.current) return;
        const accepted = result.ranked?.length ?? 0;
        const excludedCount = result.excluded?.length ?? 0;
        const step3Subs: SubStep[] = [
          { text: `수용 가능 후보 ${accepted}곳 확인`, status: 'done' },
        ];
        if (excludedCount > 0) {
          step3Subs.push({ text: `수용 불가 ${excludedCount}곳 제외`, status: 'done' });
        }
        setSub(3, step3Subs);
        setStep(3, 'done');
        await sleep(350);
        if (cancelled || !isMounted.current) return;

        // 단계4: 최적 병원 분석 (경로 + AI)
        setStep(4, 'progress');
        setSub(4, [
          { text: '경로 계산 중…', status: 'progress' },
          { text: 'AI 분석 중…', status: 'progress' },
        ]);
        await sleep(400);
        if (cancelled || !isMounted.current) return;
        const top = result.ranked?.[0];
        const eta = top?.etaMin;
        const tags = result.estimated?.displayTags?.slice(0, 3).join(' · ');
        setSub(4, [
          {
            text: top
              ? `최단 경로: ${top.name}${eta != null ? ` ${eta}분` : ''}`
              : regionText
                ? `${regionText} 분석 완료`
                : '분석 완료',
            status: 'done',
          },
          { text: tags ? `AI 최적기관 분석 · ${tags}` : 'AI 최적기관 분석', status: 'done' },
        ]);
        await sleep(500);
        setStep(4, 'done');

        if (cancelled || !isMounted.current) return;

        if (result.needsClarification) {
          navigation.replace('ClarificationScreen', {
            question: result.clarificationQuestion ?? '추가 정보가 필요합니다.',
            candidates: result.candidates ?? [],
            retry: { symptom, severity, rawQuery },
          });
        } else if (result.ranked.length === 0) {
          navigation.replace('EmptyResult');
        } else {
          navigation.replace('HospitalList', {
            result,
            symptom: symptom ?? rawQuery ?? '증상 미상',
            severity: severity ?? 'normal',
          });
        }
      } catch (e) {
        if (cancelled || !isMounted.current) return;
        const message = e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.';
        navigation.replace('ErrorScreen', {
          message,
          retry: { symptom, severity, rawQuery },
        });
      }
    };

    run();

    return () => {
      cancelled = true;
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doneCount = visibleSteps.filter((s) => status[s] === 'done').length;
  const totalSteps = visibleSteps.length;
  const currentNum = Math.min(doneCount + 1, totalSteps);

  const displayLabel = rawQuery
    ? rawQuery.length > 30
      ? `${rawQuery.slice(0, 30)}…`
      : rawQuery
    : `${severityWord(severity)} ${symptom ?? ''}`.trim();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.bgPage }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: t.textPrimary }]}>주변 응급실 확인 중…</Text>
        <Text style={[styles.subtitle, { color: t.textSecondary }]} numberOfLines={1}>
          {displayLabel}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {visibleSteps.map((id, i) => (
          <View key={id}>
            <LoadingStep
              t={t}
              status={status[id] ?? 'pending'}
              label={STEP_LABELS[id]}
              subSteps={subs[id]}
            />
            {i < visibleSteps.length - 1 && (
              <View style={[styles.connector, { backgroundColor: t.border }]} />
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={[styles.progressMeta, { color: t.textTertiary }]}>
          {currentNum}/{totalSteps}
        </Text>
        <Callout t={t} kind="warning">
          {'수용 가능 병원이 없으면\n광역응급의료상황실 연계를 안내합니다.'}
        </Callout>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 14,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  connector: {
    width: 1.5,
    height: 16,
    marginLeft: 8,
    marginVertical: 2,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  progressMeta: {
    fontSize: 12,
    textAlign: 'center',
  },
});
