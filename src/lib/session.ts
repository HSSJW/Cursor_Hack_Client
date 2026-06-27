// lib/session.ts — sessionId 생성/보관 (멀티턴 되물음용)
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const STORAGE_KEY = 'eer.sessionId';
let cached: string | null = null;

/** 기존 sessionId 반환(없으면 생성·저장). 되물음 재요청 시 멀티턴 유지에 사용. */
export async function getSessionId(): Promise<string> {
  if (cached) return cached;

  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (stored) {
    cached = stored;
    return stored;
  }

  const fresh = Crypto.randomUUID();
  cached = fresh;
  await AsyncStorage.setItem(STORAGE_KEY, fresh);
  return fresh;
}

/** 강제 새 세션 생성·저장. 새 검색(VoiceInput/KeyboardInput) 진입 시 호출. */
export async function rotateSessionId(): Promise<string> {
  const fresh = Crypto.randomUUID();
  cached = fresh;
  await AsyncStorage.setItem(STORAGE_KEY, fresh);
  return fresh;
}
