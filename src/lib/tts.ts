// lib/tts.ts — expo-speech 래퍼 (온디바이스 한국어 TTS)
import * as Speech from 'expo-speech';

type SpeakOpts = {
  onDone?: () => void;
  onError?: () => void;
};

// onDone/onStopped 콜백이 누락되는 Android 케이스 대비용 워치독 타이머
let watchdog: ReturnType<typeof setTimeout> | null = null;

function clearWatchdog(): void {
  if (watchdog) {
    clearTimeout(watchdog);
    watchdog = null;
  }
}

/**
 * 한국어로 읽어준다. 진행 중이던 발화는 멈추고 새로 시작.
 * 안드로이드에서 onDone/onStopped 콜백이 오지 않아 다음 단계로 넘어가지 못하는 문제를 막기 위해
 * 발화 길이 기반 안전 타임아웃(watchdog)을 두고, 네이티브 콜백·워치독 중 먼저 오는 쪽으로 1회만 onDone을 호출한다.
 */
export function speak(text: string, opts: SpeakOpts = {}): void {
  const { onDone, onError } = opts;
  clearWatchdog();
  Speech.stop();

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    clearWatchdog();
    onDone?.();
  };
  const fail = () => {
    if (finished) return;
    finished = true;
    clearWatchdog();
    (onError ?? onDone)?.();
  };

  // 대략 한국어 발화 길이 추정 + 여유. 콜백이 끝내 안 오면 이 타이머가 onDone을 보장.
  const estMs = Math.min(15000, 1500 + text.length * 130);
  watchdog = setTimeout(finish, estMs);

  Speech.speak(text, {
    language: 'ko-KR',
    rate: 1.0,
    pitch: 1.0,
    onDone: finish,
    onStopped: finish,
    onError: fail,
  });
}

export function stopSpeaking(): void {
  clearWatchdog();
  Speech.stop();
}
