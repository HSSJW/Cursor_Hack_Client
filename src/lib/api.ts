// lib/api.ts — 서버 /api/recommend 호출
// SERVER_BASE_URL은 Platform.OS와 환경변수에 따라 분기됨
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * SERVER_BASE_URL 우선순위:
 *  1. EXPO_PUBLIC_SERVER_BASE_URL (전체 명시적 override — 실기기 사용 시 권장)
 *  2. EXPO_PUBLIC_SERVER_BASE_URL_ANDROID / _IOS (플랫폼별 명시)
 *  3. Platform 기본값:
 *     - Android: http://10.0.2.2:8080 (에뮬레이터 localhost)
 *     - iOS:     http://localhost:8080 (시뮬레이터 localhost)
 *
 * 실기기에서 사용 시: .env에 EXPO_PUBLIC_SERVER_BASE_URL=http://개발PC_IP:8080 설정
 */
const extra = Constants.expoConfig?.extra ?? {};
const override = extra.SERVER_BASE_URL as string | undefined;
const platformDefault =
  Platform.OS === 'android'
    ? ((extra.SERVER_BASE_URL_ANDROID as string | undefined) ?? 'http://10.0.2.2:8080')
    : ((extra.SERVER_BASE_URL_IOS as string | undefined) ?? 'http://localhost:8080');
const SERVER_BASE_URL: string = override ?? platformDefault;

export type Region = {
  stage1: string;
  stage2: string;
};

export type BedStatus = {
  label: string;
  avail: number | null;
  total: number | null;
};

export type Hospital = {
  hpid: string;
  name: string;
  phone?: string;
  lat?: number;
  lon?: number;
  erAvail: number | null;
  erTotal: number | null;
  beds: BedStatus[];
  equip: { ct: boolean; mri: boolean; angio: boolean };
  accept: Record<string, 'Y' | 'N' | 'unknown'>;
  acceptMsgs: Record<string, string>;
  updatedAt: string;
  updatedMinAgo: number;
  trustScore: number;
  etaMin?: number;
  distanceKm?: number;
  reason?: string; // LLM이 생성한 한 줄 근거 (옵션)
};

export type ExcludedHospital = {
  name: string;
  reason: string;
};

/** LLM이 자유발화에서 추출한 환자 컨텍스트 — 결과 화면 헤더 태그로 표시. */
export type EstimatedContext = {
  symptom?: string | null;
  severity?: string | null;
  ageGroup?: string | null;
  requiredSpecialties?: string[] | null;
  displayTags?: string[] | null; // #43: LLM 추출 핵심 라벨 최대 3개 (우선 표시)
};

export type RecommendResult = {
  region: Region;
  ranked: Hospital[];
  excluded: ExcludedHospital[];
  summary: string;
  needsClarification?: boolean;
  clarificationQuestion?: string;
  candidates?: string[];
  estimated?: EstimatedContext | null;
  generalNearby?: Hospital[] | null; // #43: SPECIALTY_PRIORITY 시 일반 응급실 토글용
};

export type ApiResponse<T> = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
};

export type RecommendRequest = {
  lat: number;
  lon: number;
  symptom?: string;
  severity?: 'severe' | 'normal';
  rawQuery?: string;
  sessionId?: string;
};

/**
 * POST /api/recommend
 * 현재 위치 + 증상/중증도(또는 rawQuery)로 수용 가능 병원 목록을 요청합니다.
 * 서버 응답 code가 REC210이면 needsClarification=true + clarificationQuestion + candidates 포함.
 * @throws Error — HTTP 오류 또는 API 오류 코드(REC204/REC210 제외)
 */
/** 음성 인테이크에서 누적/추론하는 환자 상태 필드. (서버 PatientFields와 1:1) */
export type PatientFields = {
  symptom: string;
  severity: string;
  ageGroup: string;
  sex: string;
  requiredSpecialty: string;
  consciousness: string;
};

export function emptyFields(): PatientFields {
  return { symptom: '', severity: '', ageGroup: '', sex: '', requiredSpecialty: '', consciousness: '' };
}

export type IntakeResult = {
  fields: PatientFields;
  complete: boolean;
  nextQuestion: string;
  missingFields: string[];
};

export type IntakeRequest = {
  sessionId?: string;
  transcript: string;
  fields: PatientFields;
};

/**
 * POST /api/intake
 * 한 턴의 발화 + 누적 필드를 보내 필드 추출/보정 + 완성 여부 + 다음 질문을 받는다.
 * 성공 코드 IK200(완료)/IK210(추가 필요) 모두 result 반환.
 * @throws Error — HTTP 오류 또는 기타 API 오류 코드
 */
export async function intakeStep(req: IntakeRequest): Promise<IntakeResult> {
  const res = await fetch(`${SERVER_BASE_URL}/api/intake`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  const json: ApiResponse<IntakeResult> = await res.json();

  if (!json.isSuccess && json.code !== 'IK200' && json.code !== 'IK210') {
    throw new Error(`API ${json.code}: ${json.message}`);
  }

  return json.result;
}

export async function recommendHospitals(req: RecommendRequest): Promise<RecommendResult> {
  const res = await fetch(`${SERVER_BASE_URL}/api/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  const json: ApiResponse<RecommendResult> = await res.json();

  // REC200(정상) / REC204(빈 결과) / REC210(clarification 필요) 모두 result 반환
  if (!json.isSuccess && json.code !== 'REC204' && json.code !== 'REC210') {
    throw new Error(`API ${json.code}: ${json.message}`);
  }

  return json.result;
}
