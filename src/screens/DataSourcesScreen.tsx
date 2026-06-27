// DataSourcesScreen — 데이터 출처 고지(탭)
import React from 'react';
import { View, Text, ScrollView, Pressable, Linking, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colorDark } from '../theme/tokens';
import { AppHeader, Tag } from '../components';

type Source = {
  category: string;
  name: string;
  desc: string;
  url: string;
  official: boolean;
};

const SOURCES: Source[] = [
  {
    category: '국토교통',
    name: '시군구 행정경계 (SHP)',
    desc: '국토교통부 시군구 경계 polygon으로 좌표→행정구역(권역)을 결정합니다.',
    url: 'https://www.vworld.kr',
    official: true,
  },
  {
    category: '보건복지',
    name: '실시간 가용병상 조회',
    desc: 'getEmrrmRltmUsefulSckbdInfoInqire — 응급실 실시간 병상 가용 현황.',
    url: 'https://www.data.go.kr',
    official: true,
  },
  {
    category: '보건복지',
    name: '중증질환 수용가능 조회',
    desc: 'getSrsillDissAceptncPosblInfoInqire — 중증질환별 수용 가능 여부.',
    url: 'https://www.data.go.kr',
    official: true,
  },
  {
    category: '보건복지',
    name: '응급의료기관 기본정보',
    desc: 'getEgytListInfoInqire — 응급의료기관 위치·연락처 기본정보.',
    url: 'https://www.data.go.kr',
    official: true,
  },
  {
    category: '보건복지',
    name: '전문병원 지정 정보',
    desc: '건강보험심사평가원 전문병원 지정 데이터로 전문 분야를 매칭합니다.',
    url: 'https://www.hira.or.kr',
    official: true,
  },
  {
    category: '상용 API',
    name: 'Tmap 경로 안내',
    desc: 'Tmap 자동차 경로로 후보 병원의 ETA·거리를 계산합니다.',
    url: 'https://tmapapi.sktelecom.com',
    official: false,
  },
  {
    category: '상용 API',
    name: 'Tmap reverseGeocoding',
    desc: 'SHP 부재 시 좌표→행정구역 변환 fallback으로 사용합니다.',
    url: 'https://tmapapi.sktelecom.com',
    official: false,
  },
];

const INTRO =
  '응급 이송 도우미는 다음 공공데이터와 외부 API를 활용합니다. 모든 의료 정보는 보건복지부·국토교통부 공식 데이터셋 기반이며, 실시간 가용 정보는 응급의료 API로 직접 조회합니다.';

export default function DataSourcesScreen() {
  const t = colorDark;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.bgPage }]} edges={['top']}>
      <AppHeader t={t} title="데이터 출처" titleSize="title" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.intro, { color: t.textSecondary }]}>{INTRO}</Text>

        {SOURCES.map((s, i) => (
          <View key={i} style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
            <View style={styles.cardHead}>
              <Tag t={t} kind="muted">
                {s.category}
              </Tag>
              {s.official && (
                <View style={[styles.officialBadge, { backgroundColor: t.infoBg, borderColor: t.infoBorder }]}>
                  <Text style={[styles.officialText, { color: t.infoText }]}>공공데이터</Text>
                </View>
              )}
            </View>
            <Text style={[styles.name, { color: t.textPrimary }]}>{s.name}</Text>
            <Text style={[styles.desc, { color: t.textSecondary }]}>{s.desc}</Text>
            <Pressable onPress={() => Linking.openURL(s.url)}>
              <Text style={[styles.url, { color: t.infoText }]}>{s.url}</Text>
            </Pressable>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  intro: {
    fontSize: 13,
    lineHeight: 19,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  officialBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  officialText: {
    fontSize: 10,
    fontWeight: '500',
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
  },
  url: {
    fontSize: 12,
  },
  footer: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});
