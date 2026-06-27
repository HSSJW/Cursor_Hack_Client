// app.config.ts — Expo 앱 설정 (app.json 대체/확장)
// SERVER_BASE_URL 변경 방법:
//   1. 프로젝트 루트에 .env 파일 생성 후 EXPO_PUBLIC_SERVER_BASE_URL=http://서버IP:8080 입력
//   2. 또는 CI/CD 환경변수로 EXPO_PUBLIC_SERVER_BASE_URL 주입
//   3. extra.SERVER_BASE_URL은 Constants.expoConfig?.extra?.SERVER_BASE_URL로 런타임에 읽음
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: '응급 이송 도우미',
  slug: 'eer-client',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  ios: {
    supportsTablet: false,
  },
  android: {
    package: 'com.eer.app', // #12: Gradle 빌드/설치용 applicationId
    adaptiveIcon: {
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      backgroundColor: '#16160F',
    },
    predictiveBackGestureEnabled: false,
    permissions: [
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
    ],
  },
  plugins: [
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: '응급 이송 병원 매칭을 위해 현재 위치가 필요합니다.',
        locationWhenInUsePermission: '응급 이송 병원 매칭을 위해 현재 위치가 필요합니다.',
      },
    ],
    [
      'expo-speech-recognition',
      {
        microphonePermission: '음성으로 증상을 입력하기 위해 마이크 접근 권한이 필요합니다.',
        speechRecognitionPermission: '음성 인식으로 증상을 입력하기 위해 음성 인식 권한이 필요합니다.',
        androidSpeechServicePackages: ['com.google.android.googlequicksearchbox'],
      },
    ],
  ],
  extra: {
    // 우선순위: EXPO_PUBLIC_SERVER_BASE_URL > 플랫폼별 default (api.ts에서 Platform.OS 분기)
    // 명시적 override가 필요하면 .env에 EXPO_PUBLIC_SERVER_BASE_URL=http://서버IP:8080 설정
    SERVER_BASE_URL: process.env.EXPO_PUBLIC_SERVER_BASE_URL,
    SERVER_BASE_URL_ANDROID: process.env.EXPO_PUBLIC_SERVER_BASE_URL_ANDROID ?? 'http://10.0.2.2:8080',
    SERVER_BASE_URL_IOS: process.env.EXPO_PUBLIC_SERVER_BASE_URL_IOS ?? 'http://localhost:8080',
  },
});
