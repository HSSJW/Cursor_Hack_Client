// Hospital 타입 — PLAN.md §6 API 계약 기준 (00_INDEX §5와 1:1)
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
  equip: {
    ct: boolean;
    mri: boolean;
    angio: boolean;
  };
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

/** #43 UX: LLM이 자유발화에서 추출한 환자 컨텍스트 (결과 화면 태그용). */
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

// 네비게이션 파라미터 타입
export type RootStackParamList = {
  VoiceInput: undefined;
  KeyboardInput: undefined;
  Loading: {
    symptom?: string;
    severity?: 'severe' | 'normal';
    rawQuery?: string;
    sessionId?: string; // P2-j: 새 검색 시 명시적 rotate 후 전달
  };
  HospitalList: {
    result: RecommendResult;
    symptom: string;
    severity: 'severe' | 'normal';
  };
  HospitalDetail: {
    hospital: Hospital;
  };
  EmptyResult: undefined;
  ErrorScreen: {
    message?: string;
    lastUpdatedAt?: string;
    // retry는 직렬화 가능한 컨텍스트로만 보존 (React Navigation 비직렬화 경고 회피)
    retry?: {
      symptom?: string;
      severity?: 'severe' | 'normal';
      rawQuery?: string;
    };
  };
  ClarificationScreen: {
    question: string;
    candidates: string[];
    retry: {
      symptom?: string;
      severity?: 'severe' | 'normal';
      rawQuery?: string;
    };
  };
};

/** 하단 탭바 라우트. */
export type RootTabParamList = {
  SearchTab: undefined; // 검색 흐름 (내부 NativeStack)
  DataSourcesTab: undefined; // 데이터 출처 정적 화면
};
