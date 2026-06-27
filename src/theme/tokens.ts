// theme/tokens.ts — 디자인 토큰 (디자인/tokens.jsx 포팅)
// 라이트/다크 모두 정의하되 앱은 다크(colorDark)만 사용한다.

export const colorLight = {
  bgPage: '#FFFFFF',
  surface: '#F3F1EC',
  surfaceAlt: '#EBE9E3',
  textPrimary: '#1A1A18',
  textSecondary: '#6B6A64',
  textTertiary: '#9A9990',
  border: '#E5E3DC',
  borderStrong: '#D5D3CC',
  infoText: '#185FA5',
  infoBg: '#E6F1FB',
  infoBorder: '#B5D4F4',
  successText: '#3B6D11',
  successBg: '#EAF3DE',
  successBorder: '#CDE0B0',
  warningText: '#854F0B',
  warningBg: '#FAEEDA',
  warningBorder: '#EBD4A7',
  dangerText: '#A32D2D',
  dangerBg: '#FCEBEB',
  dangerBorder: '#F0C7C7',
  trackBg: '#E5E3DC',
} as const;

export const colorDark = {
  bgPage: '#16160F',
  surface: '#26261F',
  surfaceAlt: '#2F2F27',
  textPrimary: '#F5F4EF',
  textSecondary: '#B4B2A9',
  textTertiary: '#888780',
  border: '#3A3A34',
  borderStrong: '#4A4A43',
  infoText: '#85B7EB',
  infoBg: '#0C2A45',
  infoBorder: '#1E4A75',
  successText: '#97C459',
  successBg: '#1E3010',
  successBorder: '#345020',
  warningText: '#EF9F27',
  warningBg: '#3A2A0A',
  warningBorder: '#5A4014',
  dangerText: '#F09595',
  dangerBg: '#3A1414',
  dangerBorder: '#5A2424',
  trackBg: '#3A3A34',
} as const;

export const typography = {
  h1: { fontSize: 22, fontWeight: '500', lineHeight: 28, letterSpacing: -0.22 },
  h2: { fontSize: 18, fontWeight: '500', lineHeight: 24, letterSpacing: -0.18 },
  title: { fontSize: 16, fontWeight: '500', lineHeight: 22, letterSpacing: -0.08 },
  body: { fontSize: 14, fontWeight: '400', lineHeight: 20, letterSpacing: 0 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 16, letterSpacing: 0 },
  micro: { fontSize: 11, fontWeight: '400', lineHeight: 14, letterSpacing: 0 },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

/** 21개 컬러 키를 모두 string으로 갖는 타입(라이트/다크 호환). 모든 컴포넌트가 t: ColorTokens prop을 받는다. */
export type ColorTokens = {
  bgPage: string;
  surface: string;
  surfaceAlt: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  borderStrong: string;
  infoText: string;
  infoBg: string;
  infoBorder: string;
  successText: string;
  successBg: string;
  successBorder: string;
  warningText: string;
  warningBg: string;
  warningBorder: string;
  dangerText: string;
  dangerBg: string;
  dangerBorder: string;
  trackBg: string;
};

export type ThemeMode = 'light' | 'dark';

export function getColors(mode: ThemeMode): ColorTokens {
  return mode === 'dark' ? colorDark : colorLight;
}

export const tokens = {
  light: colorLight,
  dark: colorDark,
  typography,
  spacing,
  radius,
};

export default tokens;
