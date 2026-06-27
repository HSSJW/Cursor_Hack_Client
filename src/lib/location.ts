// lib/location.ts — 현재 위치(GPS) 취득
import * as Location from 'expo-location';

export type LatLon = { lat: number; lon: number };

/**
 * 포그라운드 위치 권한 요청 후 현재 좌표를 반환.
 * @throws Error — 권한 거부 시
 */
export async function getCurrentLocation(): Promise<LatLon> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('위치 권한이 거부되었습니다. 설정에서 위치 접근을 허용해 주세요.');
  }

  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return { lat: pos.coords.latitude, lon: pos.coords.longitude };
}
