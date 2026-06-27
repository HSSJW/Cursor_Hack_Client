// lib/mkioskCatalog.ts — MKioskTy{N} → 한글 라벨 (서버 util/MkioskCatalog.java 동기화)

const LABELS: Record<number, string> = {
  1: '심근경색 재관류중재술',
  2: '뇌출혈 수술',
  3: '뇌경색 재관류',
  4: '심장질환 응급',
  5: '대동맥 응급',
  6: '담낭담관질환 응급',
  7: '위장관 응급내시경',
  8: '복부응급수술',
  9: '장중첩/폐색 응급',
  10: '응급투석',
  11: '중증외상',
  12: '응급내시경',
  13: '산부인과 응급',
  14: '신생아 응급',
  15: '중증화상',
  16: '사지접합',
  17: '응급분만',
  18: '정신과적 응급',
  19: '안과적 응급',
  20: '저체중 출생아',
  21: '중증 소아 응급',
  22: '화상',
  23: '독성물질 중독',
  24: '저체온/고체온',
  25: '재관류중재술(소아)',
  26: '소아응급',
  27: '응급내시경(소아)',
  28: '중환자 입원',
};

function parseIndex(key: string, suffix?: string): number | null {
  let s = key;
  if (suffix && s.endsWith(suffix)) {
    s = s.slice(0, -suffix.length);
  }
  if (!s.startsWith('MKioskTy')) return null;
  const n = parseInt(s.slice('MKioskTy'.length), 10);
  return Number.isNaN(n) ? null : n;
}

/** "MKioskTy12" → "응급내시경". 매핑 없으면 원본 key 반환. */
export function mkioskLabel(key: string): string {
  const idx = parseIndex(key);
  if (idx == null) return key;
  return LABELS[idx] ?? key;
}

/** "MKioskTy12Msg" → "응급내시경". 매핑 없으면 원본 key 반환. */
export function mkioskMsgLabel(key: string): string {
  const idx = parseIndex(key, 'Msg');
  if (idx == null) return key;
  return LABELS[idx] ?? key;
}
