# 응급 이송 도우미 — Client

> 구급대원 **음성 입력 → 온보딩 → 병원 추천**을 수행하는 Expo/React Native 모바일 앱

| | |
|---|---|
| **앱 이름** | 응급 이송 도우미 (`com.eer.app`) |
| **Backend (AI·API)** | **[Cursor_Hack](https://github.com/HSSJW/Cursor_Hack)** ← LLM 아키텍처·OpenAPI·외부 API 연동은 서버 README 참고 |
| **Stack** | Expo SDK 56 · React Native · TypeScript |

---

## Backend와의 관계

본 클라이언트는 **UI·음성 I/O·GPS**만 담당합니다.  
LLM 호출, Structured Output 파싱, 공공데이터·Tmap 연동, 추천 로직은 **전부 Backend**에서 처리합니다.

```
[Client]  STT 텍스트 ──► POST /api/intake  ──► [Server + Gemini]
          GPS + rawQuery ► POST /api/recommend ► [Server + EMR + Tmap + Gemini]
          ◄── JSON (필드 / 병원 목록 / TTS 질문)
```

→ **AI 솔루션 설계, Function Calling형 Structured Output, OpenAPI, 외부 API**:  
**[Backend README](https://github.com/HSSJW/Cursor_Hack)**

---

## Client 역할

| 영역 | 구현 |
|------|------|
| **음성 온보딩** | 연속 STT + 1.5초 침묵 엔드포인팅 → `/api/intake` 턴 반복 |
| **TTS 루프** | 서버 `nextQuestion`을 읽어주고 자동 재청취 (TTS 중 마이크 OFF) |
| **온보딩 UI** | 말풍선 + 수집 필드 카드 + 완료 결과 모달 |
| **병원 탐색** | 온보딩 완료 → `/api/recommend` → 단계별 Loading UI |
| **결과 표시** | HospitalList / Detail, 제외 사유, LLM 태그 |

---

## 프로젝트 구조

```
eer-client/
├── App.tsx                     # Navigation (탭 + 스택)
├── app.config.ts               # 앱명, 권한, SERVER_BASE_URL
├── .env.example
│
└── src/
    ├── screens/
    │   ├── VoiceInput.tsx          # 핸즈프리 음성 온보딩 (메인)
    │   ├── Loading.tsx             # /api/recommend + 진행 UI
    │   ├── HospitalList.tsx
    │   ├── HospitalDetail.tsx
    │   ├── KeyboardInput.tsx       # 키보드 입력 경로
    │   └── ClarificationScreen.tsx # REC210 되물음
    │
    ├── lib/
    │   ├── api.ts                  # Server API 클라이언트 (OpenAPI 계약 1:1)
    │   ├── stt.ts                  # expo-speech-recognition
    │   ├── tts.ts                  # expo-speech + onDone 워치독
    │   ├── location.ts
    │   └── session.ts              # sessionId (멀티턴)
    │
    ├── components/                 # MicButton, HospitalCard, LoadingStep …
    ├── theme/
    └── types/
```

---

## 빠른 시작

```bash
git clone https://github.com/HSSJW/Cursor_Hack_Client.git
cd Cursor_Hack_Client
npm install
cp .env.example .env
# EXPO_PUBLIC_SERVER_BASE_URL=http://<PC_IP>:8080

# Backend 먼저 기동 (https://github.com/HSSJW/Cursor_Hack)
npx expo run:android
```

실기기 + PC 로컬 서버:

```bash
adb reverse tcp:8080 tcp:8080
adb reverse tcp:8081 tcp:8081
```

`.env`: `EXPO_PUBLIC_SERVER_BASE_URL=http://localhost:8080`

---

## Related

- **Backend (AI·API·아키텍처)**: https://github.com/HSSJW/Cursor_Hack
