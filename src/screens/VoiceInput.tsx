// VoiceInput — STT Push-to-Talk (초기 라우트, 홈)
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colorDark } from '../theme/tokens';
import type { RootStackParamList } from '../types/hospital';
import { ChatBubble, MicButton, Chip } from '../components';
import {
  requestSttPermissions,
  checkSttPermissions,
  startListening,
  stopListening,
  armNetworkSttFallback,
  useSpeechRecognitionEvent,
} from '../lib/stt';
import { rotateSessionId } from '../lib/session';

type Props = NativeStackScreenProps<RootStackParamList, 'VoiceInput'>;

type Message = { role: 'agent' | 'user'; text: string };

export default function VoiceInput({ navigation }: Props) {
  const t = colorDark;

  const [messages, setMessages] = useState<Message[]>([
    { role: 'agent', text: '환자 상태를 말씀해 주세요.' },
  ]);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');

  const permissionRef = useRef(false);
  const ptHeldRef = useRef(false);
  const accumulatedRef = useRef('');
  const interimRef = useRef('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    (async () => {
      permissionRef.current = await requestSttPermissions();
    })();
  }, []);

  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results?.[0]?.transcript ?? '';
    if (event.isFinal) {
      accumulatedRef.current = (accumulatedRef.current + ' ' + transcript).trim();
      interimRef.current = '';
      setInterim('');
    } else {
      interimRef.current = transcript;
      setInterim(transcript);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    const code = event.error;
    // no-speech/aborted/speech-timeout/client 는 정상 종료·중단 계열 → 무시.
    // (PTT에서 손을 떼며 stop() 할 때 'client' 가 흔히 발생하지만 이미 결과는 수신됨)
    if (
      code === 'no-speech' ||
      code === 'aborted' ||
      code === 'speech-timeout' ||
      code === 'client'
    ) {
      return;
    }
    if (code === 'service-not-allowed' || code === 'language-not-supported') {
      armNetworkSttFallback();
      Alert.alert('음성 인식', '네트워크 음성 인식 모드로 전환합니다. 다시 시도해 주세요.');
      return;
    }
    Alert.alert('음성 인식 오류', `오류 코드: ${code}`);
  });

  useSpeechRecognitionEvent('end', () => {
    if (ptHeldRef.current) {
      // 침묵 자동종료 대응 — 누르고 있으면 재시작
      startListening();
    } else {
      setListening(false);
    }
  });

  const handlePressIn = async () => {
    // 이미 누름 처리 중이면 중복 start 방지 (onPressIn/onLongPress 중복 호출 → RecognitionService capacity full 회피)
    if (ptHeldRef.current) return;
    ptHeldRef.current = true;
    if (!permissionRef.current) {
      const granted = await requestSttPermissions();
      permissionRef.current = granted;
      if (!granted) {
        ptHeldRef.current = false;
        Alert.alert('권한 필요', '음성 입력을 위해 마이크/음성 인식 권한이 필요합니다.');
        return;
      }
    }
    accumulatedRef.current = '';
    interimRef.current = '';
    setInterim('');
    setListening(true);
    startListening();
  };

  const handlePressOut = () => {
    ptHeldRef.current = false;
    if (listening) {
      stopListening();
    }
    setTimeout(async () => {
      const finalText = `${accumulatedRef.current} ${interimRef.current}`.trim();
      setListening(false);
      if (!finalText) return;
      setMessages((prev) => [...prev, { role: 'user', text: finalText }]);
      const sessionId = await rotateSessionId();
      navigation.navigate('Loading', { rawQuery: finalText, sessionId });
    }, 300);
  };

  const pttHint = listening
    ? '말씀하세요 — 손을 떼면 검색 시작'
    : '누르고 있는 동안 말씀하세요';

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
        {listening && interim ? (
          <ChatBubble t={t} role="user">
            {interim}
          </ChatBubble>
        ) : null}
      </ScrollView>

      <View style={styles.bottom}>
        <MicButton
          t={t}
          listening={listening}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        />
        <Text style={[styles.hint, { color: t.textSecondary }]}>{pttHint}</Text>
        <Pressable onPress={() => navigation.navigate('KeyboardInput')}>
          <Text style={[styles.link, { color: t.infoText }]}>키보드로 입력</Text>
        </Pressable>
      </View>
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
