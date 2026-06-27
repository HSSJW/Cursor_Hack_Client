// lib/linking.ts — 전화/내비 딥링크
import { Linking, Platform } from 'react-native';

/**
 * 전화 연결: tel:{digits}
 * @throws Error — 전화 기능 미지원 시
 */
export async function callPhone(phone: string): Promise<void> {
  const digits = phone.replace(/[^0-9+]/g, '');
  const url = `tel:${digits}`;
  const ok = await Linking.canOpenURL(url);
  if (!ok) {
    throw new Error('전화 연결을 지원하지 않는 기기입니다.');
  }
  await Linking.openURL(url);
}

/**
 * Tmap 길찾기: tmap://route?goalname=...&goalx={lon}&goaly={lat}
 * (goalx=경도, goaly=위도). 미설치 시 Platform별 지도 fallback.
 */
export async function openTmap(lat: number, lon: number, name: string): Promise<void> {
  const encodedName = encodeURIComponent(name);
  const tmapUrl = `tmap://route?goalname=${encodedName}&goalx=${lon}&goaly=${lat}`;

  const ok = await Linking.canOpenURL(tmapUrl);
  if (ok) {
    await Linking.openURL(tmapUrl);
    return;
  }

  // Tmap 미설치 fallback
  const fallback =
    Platform.select({
      android: `geo:${lat},${lon}?q=${lat},${lon}(${encodedName})`,
      ios: `http://maps.apple.com/?ll=${lat},${lon}&q=${encodedName}`,
      default: `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`,
    }) ?? `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;

  await Linking.openURL(fallback);
}
