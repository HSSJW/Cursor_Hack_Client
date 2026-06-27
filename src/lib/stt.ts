// lib/stt.ts — expo-speech-recognition 래퍼 (on-device 우선 + 네트워크 폴백)
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

export type SttStatus = 'idle' | 'listening' | 'error';

// 한 번 켜지면 앱 수명 동안 네트워크 STT 사용
let networkFallbackArmed = false;

/** 마이크/음성 인식 권한 요청 → granted 여부 */
export async function requestSttPermissions(): Promise<boolean> {
  const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
  return result.granted;
}

/** 현재 권한 상태 확인 */
export async function checkSttPermissions(): Promise<boolean> {
  const result = await ExpoSpeechRecognitionModule.getPermissionsAsync();
  return result.granted;
}

/** on-device STT 실패 시 네트워크 STT로 전환(앱 수명 동안 유지) */
export function armNetworkSttFallback(): void {
  networkFallbackArmed = true;
}

export function isNetworkSttFallback(): boolean {
  return networkFallbackArmed;
}

function supportsOnDevice(): boolean {
  try {
    return ExpoSpeechRecognitionModule.supportsOnDeviceRecognition();
  } catch {
    return false;
  }
}

/**
 * 인식 시작 — 핸즈프리 연속 인식용.
 * 네트워크(구글) 인식기 사용: 온디바이스 ko-KR 모델이 오디오를 받고도 'no-speech'를
 * 반환하는 기기(삼성 등)가 있어, 안정적인 네트워크 인식을 기본으로 한다.
 * continuous:true 로 계속 듣고, 발화 종료(엔드포인팅)는 화면 쪽 JS 무음 타이머가 1차로 판정한다.
 * native 무음 타임아웃은 그 직후에 동작하도록 백업으로만 살짝 길게 둔다.
 */
export function startListening(): void {
  ExpoSpeechRecognitionModule.start({
    lang: 'ko-KR',
    interimResults: true,
    continuous: true,
    requiresOnDeviceRecognition: false,
    androidIntentOptions: {
      EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS: 1000,
      EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 2000,
      EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 2000,
    },
  });
}

/** 정상 종료(최종 결과 대기) */
export function stopListening(): void {
  ExpoSpeechRecognitionModule.stop();
}

/** 즉시 중단 */
export function abortListening(): void {
  ExpoSpeechRecognitionModule.abort();
}

export { useSpeechRecognitionEvent };
