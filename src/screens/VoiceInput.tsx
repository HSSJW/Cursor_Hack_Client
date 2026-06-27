// VoiceInput — 핸즈프리 음성 인테이크 (버튼 1회 → 연속 인식 → 침묵 종료 감지 → /api/intake → TTS 질문 → 재개)
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Modal, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colorDark } from '../theme/tokens';
import type { ColorTokens } from '../theme/tokens';
import type { RootStackParamList } from '../types/hospital';
import { ChatBubble, MicButton, Chip } from '../components';
import {
  requestSttPermissions,
  startListening,
  stopListening,
  abortListening,
  armNetworkSttFallback,
  useSpeechRecognitionEvent,
} from '../lib/stt';
import { speak, stopSpeaking } from '../lib/tts';
import { intakeStep, emptyFields } from '../lib/api';
import type { PatientFields } from '../lib/api';
import { rotateSessionId } from '../lib/session';

type Props = NativeStackScreenProps<RootStackParamList, 'VoiceInput'>;

type Message = { role: 'agent' | 'user'; text: string };
type Phase = 'idle' | 'listening' | 'thinking' | 'speaking';

// 발화 종료(엔드포인팅) 판정용 무음 시간. 이 시간 동안 새 인식 결과가 없으면 한 턴으로 본다.
const SILENCE_MS = 1500;
// TTS onDone 콜백이 안 올 때를 대비한 안전 타임아웃(완료 후 탐색 화면 이동 보장).
const NAV_FALLBACK_MS = 4000;

/** 수집된 필드를 추천 파이프라인용 자유발화(rawQuery)로 조립. */
function buildRawQuery(f: PatientFields): string {
  const parts: string[] = [];
  const who = [f.ageGroup, f.sex].filter(Boolean).join(' ');
  if (who) parts.push(`${who} 환자`);
  if (f.symptom) parts.push(f.symptom);
  if (f.severity) parts.push(`중증도 ${f.severity}`);
  if (f.requiredSpecialty) parts.push(`${f.requiredSpecialty} 필요`);
  if (f.consciousness) parts.push(`의식 ${f.consciousness}`);
  return parts.join(', ');
}

type FieldDef = { key: keyof PatientFields; label: string; required: boolean };

const FIELD_DEFS: FieldDef[] = [
  { key: 'symptom', label: '증상', required: true },
  { key: 'severity', label: '중증도', required: true },
  { key: 'ageGroup', label: '연령대', required: true },
  { key: 'sex', label: '성별', required: true },
  { key: 'requiredSpecialty', label: '진료과', required: false },
  { key: 'consciousness', label: '의식', required: false },
];

/** 온보딩 필드 표(증상/중증도/연령대/진료과/의식) — 말풍선 아래 카드 & 완료 모달에서 공용. */
function FieldRows({ t, fields }: { t: ColorTokens; fields: PatientFields }) {
  return (
    <View style={styles.fieldRows}>
      {FIELD_DEFS.map(({ key, label, required }) => {
        const v = fields[key];
        const placeholder = required ? '입력 대기' : '—';
        return (
          <View key={key} style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: t.textTertiary }]}>{label}</Text>
            <Text
              style={[styles.fieldValue, { color: v ? t.textPrimary : t.textTertiary }]}
              numberOfLines={1}
            >
              {v || placeholder}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function hasAnyField(f: PatientFields): boolean {
  return !!(f.symptom || f.severity || f.ageGroup || f.sex || f.requiredSpecialty || f.consciousness);
}

export default function VoiceInput({ navigation }: Props) {
  const t = colorDark;

  const [messages, setMessages] = useState<Message[]>([
    { role: 'agent', text: '마이크를 한 번 누른 뒤, 환자 상태를 말씀해 주세요.' },
  ]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [interim, setInterim] = useState('');
  const [fields, setFields] = useState<PatientFields>(emptyFields());
  const [resultModal, setResultModal] = useState<PatientFields | null>(null);

  const phaseRef = useRef<Phase>('idle');
  const sessionActiveRef = useRef(false);
  const bufferRef = useRef('');
  const interimRef = useRef('');
  const fieldsRef = useRef<PatientFields>(emptyFields());
  const sessionIdRef = useRef<string>('');
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigatedRef = useRef(false);
  const permissionRef = useRef(false);
  const scrollRef = useRef<ScrollView>(null);

  const setPhaseBoth = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  const addMessage = (m: Message) => setMessages((prev) => [...prev, m]);

  useEffect(() => {
    (async () => {
      permissionRef.current = await requestSttPermissions();
    })();
    return () => {
      // 화면 이탈 시 정리
      sessionActiveRef.current = false;
      clearSilenceTimer();
      stopSpeaking();
      try {
        abortListening();
      } catch {
        /* noop */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const armSilenceTimer = () => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      onUtteranceEnd();
    }, SILENCE_MS);
  };

  useSpeechRecognitionEvent('result', (event) => {
    if (!sessionActiveRef.current || phaseRef.current !== 'listening') return;
    const transcript = event.results?.[0]?.transcript ?? '';
    if (event.isFinal) {
      bufferRef.current = `${bufferRef.current} ${transcript}`.trim();
      interimRef.current = '';
      setInterim('');
    } else {
      interimRef.current = transcript;
      setInterim(transcript);
    }
    armSilenceTimer();
  });

  useSpeechRecognitionEvent('error', (event) => {
    const code = event.error;
    // 정상 종료·중단 계열은 무시 (PTT 아님 — 연속 인식 중 빈번)
    if (code === 'no-speech' || code === 'aborted' || code === 'speech-timeout' || code === 'client') {
      return;
    }
    if (code === 'service-not-allowed' || code === 'language-not-supported') {
      armNetworkSttFallback();
      return;
    }
    // 그 외 오류: 세션은 유지하되 사용자에게 안내
    if (sessionActiveRef.current) {
      Alert.alert('음성 인식 오류', `오류 코드: ${code}`);
    }
  });

  useSpeechRecognitionEvent('end', () => {
    // 연속 인식이 native 무음 등으로 끊긴 경우 복구.
    if (!sessionActiveRef.current || phaseRef.current !== 'listening') return;
    if (bufferRef.current.trim() || interimRef.current.trim()) {
      onUtteranceEnd();
    } else {
      // 내용 없이 끊겼으면 계속 듣기 위해 재시작
      startListening();
    }
  });

  const onUtteranceEnd = async () => {
    if (phaseRef.current !== 'listening') return;
    clearSilenceTimer();
    const text = `${bufferRef.current} ${interimRef.current}`.trim();
    bufferRef.current = '';
    interimRef.current = '';
    setInterim('');
    if (!text) return; // 빈 발화면 계속 듣기

    setPhaseBoth('thinking');
    stopListening();
    addMessage({ role: 'user', text });

    try {
      const res = await intakeStep({
        sessionId: sessionIdRef.current,
        transcript: text,
        fields: fieldsRef.current,
      });
      fieldsRef.current = res.fields;
      setFields(res.fields);

      if (res.complete) {
        finishSession(res.fields);
      } else {
        const q = res.nextQuestion || '환자 상태를 조금 더 말씀해 주세요.';
        addMessage({ role: 'agent', text: q });
        setPhaseBoth('speaking');
        speak(q, { onDone: resumeListening });
      }
    } catch {
      const msg = '서버 연결에 실패했어요. 다시 말씀해 주세요.';
      addMessage({ role: 'agent', text: msg });
      setPhaseBoth('speaking');
      speak(msg, { onDone: resumeListening });
    }
  };

  const resumeListening = () => {
    if (!sessionActiveRef.current) return;
    bufferRef.current = '';
    interimRef.current = '';
    setInterim('');
    setPhaseBoth('listening');
    startListening();
  };

  const goLoading = (rawQuery: string) => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    setResultModal(null);
    navigation.navigate('Loading', { rawQuery, sessionId: sessionIdRef.current });
  };

  const finishSession = (f: PatientFields) => {
    sessionActiveRef.current = false;
    clearSilenceTimer();
    try {
      abortListening();
    } catch {
      /* noop */
    }
    const rawQuery = buildRawQuery(f);
    addMessage({ role: 'agent', text: '최적 병원 탐색을 시작합니다.' });
    // 완료 결과 모달 + 음성 안내 동시 출력
    setResultModal(f);
    setPhaseBoth('speaking');
    speak('최적 병원 탐색을 시작합니다.', { onDone: () => goLoading(rawQuery) });
    // TTS onDone 누락 대비 안전 이동
    setTimeout(() => goLoading(rawQuery), NAV_FALLBACK_MS);
  };

  const startSession = async () => {
    if (sessionActiveRef.current) return;
    if (!permissionRef.current) {
      const granted = await requestSttPermissions();
      permissionRef.current = granted;
      if (!granted) {
        Alert.alert('권한 필요', '음성 입력을 위해 마이크/음성 인식 권한이 필요합니다.');
        return;
      }
    }
    navigatedRef.current = false;
    sessionIdRef.current = await rotateSessionId();
    fieldsRef.current = emptyFields();
    setFields(emptyFields());
    setResultModal(null);
    setMessages([{ role: 'agent', text: '환자 상태를 말씀해 주세요.' }]);
    sessionActiveRef.current = true;
    resumeListening();
  };

  const stopSession = () => {
    sessionActiveRef.current = false;
    clearSilenceTimer();
    stopSpeaking();
    try {
      abortListening();
    } catch {
      /* noop */
    }
    setInterim('');
    setPhaseBoth('idle');
  };

  const toggleSession = () => {
    if (sessionActiveRef.current) {
      stopSession();
    } else {
      startSession();
    }
  };

  const hint = (() => {
    switch (phase) {
      case 'listening':
        return '말씀하세요 — 잠시 멈추면 자동으로 인식합니다';
      case 'thinking':
        return '분석 중…';
      case 'speaking':
        return '안내 중…';
      default:
        return '마이크를 눌러 시작하세요';
    }
  })();

  const micLabel =
    phase === 'thinking' ? '분석 중…' : phase === 'speaking' ? '안내 중…' : '듣는 중…';

  const showFieldsCard = phase !== 'idle' || hasAnyField(fields);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.bgPage }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: t.textPrimary }]}>음성으로 지시</Text>
        <Chip t={t} selected>
          • GPS · 음성 입력
        </Chip>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.chat}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        <Text style={[styles.sessionLabel, { color: t.textTertiary }]}>새 세션</Text>
        {messages.map((m, i) => (
          <ChatBubble key={i} t={t} role={m.role}>
            {m.text}
          </ChatBubble>
        ))}
        {phase === 'listening' && interim ? (
          <ChatBubble t={t} role="user">
            {interim}
          </ChatBubble>
        ) : null}

        {/* AI 말풍선 아래 — 현재까지 수집된 온보딩 필드 */}
        {showFieldsCard && (
          <View style={[styles.fieldsCard, { backgroundColor: t.surface, borderColor: t.border }]}>
            <Text style={[styles.fieldsCardTitle, { color: t.textSecondary }]}>
              수집된 환자 정보
            </Text>
            <FieldRows t={t} fields={fields} />
          </View>
        )}
      </ScrollView>

      <View style={styles.bottom}>
        <MicButton
          t={t}
          listening={phase === 'listening'}
          onPress={toggleSession}
          label={micLabel}
          accessibilityLabel="음성 인테이크 시작/중지"
        />
        <Text style={[styles.hint, { color: t.textSecondary }]}>{hint}</Text>
        <Pressable onPress={() => navigation.navigate('KeyboardInput')}>
          <Text style={[styles.link, { color: t.infoText }]}>키보드로 입력</Text>
        </Pressable>
      </View>

      {/* 온보딩 완료 — "최적 병원 탐색을 시작합니다" 음성과 함께 결과 모달 */}
      <Modal visible={resultModal !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: t.surface, borderColor: t.border }]}>
            <Text style={[styles.modalTitle, { color: t.textPrimary }]}>온보딩 완료</Text>
            <Text style={[styles.modalSubtitle, { color: t.textSecondary }]}>
              최적 병원 탐색을 시작합니다…
            </Text>
            {resultModal && <FieldRows t={t} fields={resultModal} />}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
  },
  chat: {
    flex: 1,
  },
  fieldsCard: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  fieldsCardTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  fieldRows: {
    gap: 6,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  fieldLabel: {
    fontSize: 13,
    width: 56,
  },
  fieldValue: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    gap: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  chatContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  sessionLabel: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 4,
  },
  bottom: {
    alignItems: 'center',
    paddingBottom: 24,
    paddingTop: 8,
    gap: 12,
  },
  hint: {
    fontSize: 13,
  },
  link: {
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
