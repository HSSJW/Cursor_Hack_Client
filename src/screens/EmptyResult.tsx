// EmptyResult — REC204 / ranked 0
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colorDark } from '../theme/tokens';
import type { RootStackParamList } from '../types/hospital';
import { AppHeader, CTAButton, Callout } from '../components';
import { callPhone } from '../lib/linking';

type Props = NativeStackScreenProps<RootStackParamList, 'EmptyResult'>;

export default function EmptyResult({ navigation }: Props) {
  const t = colorDark;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.bgPage }]} edges={['top']}>
      <AppHeader t={t} onBack={() => navigation.goBack()} title="수용 가능 병원" />

      <View style={styles.center}>
        <View style={[styles.iconCircle, { backgroundColor: t.surface, borderColor: t.border }]}>
          <Text style={styles.icon}>🔍</Text>
        </View>
        <Text style={[styles.title, { color: t.textPrimary }]}>
          {'주변에 수용 가능한 병원을\n찾지 못했어요'}
        </Text>
        <Text style={[styles.desc, { color: t.textSecondary }]}>
          반경 5km 내 응답한 8곳 중 수용 가능한 곳이 없습니다.
        </Text>
        <View style={styles.actions}>
          <CTAButton t={t} variant="primary" onPress={() => navigation.goBack()}>
            반경 넓혀 다시 검색
          </CTAButton>
          <CTAButton t={t} variant="secondary" onPress={() => navigation.goBack()}>
            전체 병원 보기
          </CTAButton>
        </View>
      </View>

      <View style={styles.footer}>
        <Callout t={t} kind="warning">
          수용 가능 병원이 없을 때는 광역응급의료상황실(119)에서 이송 병원을 연계합니다.
        </Callout>
        <CTAButton t={t} variant="primary" onPress={() => callPhone('119')}>
          광역응급의료상황실 연결
        </CTAButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 30 },
  title: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 26,
  },
  desc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    alignSelf: 'stretch',
    gap: 8,
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
});
