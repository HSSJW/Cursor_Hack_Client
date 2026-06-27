// lib/specialtyLabel.ts — specialty/severity/ageGroup 한글화 (서버 util/Specialty.java 동기화)

const SPECIALTY_LABELS: Record<string, string> = {
  pediatric_er: '어린이 응급',
  trauma_center: '권역외상',
  regional_er: '권역응급',
  psychiatric_er: '정신응급',
  replantation: '수지접합',
  burn_center: '화상',
  nicu: '신생아 중환자',
  angio: '혈관조영',
  ecmo: 'ECMO',
};

const SEVERITY_LABELS: Record<string, string> = {
  severe: '중증',
  moderate: '보통',
  normal: '일반',
};

const AGE_GROUP_LABELS: Record<string, string> = {
  neonate: '신생아',
  infant: '영아',
  pediatric: '소아',
  adult: '성인',
  elderly: '고령',
};

/** "replantation" → "수지접합". 매핑 없으면 원본 key 반환. */
export function specialtyLabel(key: string): string {
  return SPECIALTY_LABELS[key] ?? key;
}

/** severe/moderate/normal → 중증/보통/일반 */
export function severityLabel(severity?: string | null): string | null {
  if (!severity) return null;
  return SEVERITY_LABELS[severity] ?? severity;
}

/** neonate/infant/pediatric/adult/elderly → 신생아/영아/소아/성인/고령 */
export function ageGroupLabel(ageGroup?: string | null): string | null {
  if (!ageGroup) return null;
  return AGE_GROUP_LABELS[ageGroup] ?? ageGroup;
}
