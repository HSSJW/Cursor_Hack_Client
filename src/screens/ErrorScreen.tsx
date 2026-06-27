// ErrorScreen — 오류/오프라인
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colorDark } from '../theme/tokens';
import type { RootStackParamList } from '../types/hospital';
import { AppHeader, CTAButton } from '../components';

type Props = NativeStackScreenProps<RootStackParamList, 'ErrorScreen'>;

export default function ErrorScreen({ navigation, route }: Props) {
  const t = colorDark;
  const { message, lastUpdatedAt, retry } = route.params ?? {};

  const handleRetry = () => {
    if (retry) {
      navigation.replace('Loading', retry);
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.bgPage }]} edges={['top']}>
      <AppHeader t={t} onBack={() => navigation.goBack()} title="실시간 정보" />

      <View style={styles.center}>
        <Text style={styles.icon}>📡</Text>
        <Text style={[styles.title, { color: t.textPrimary }]}>
          {'실시간 정보를\n불러오지 못했어요'}
        </Text>
        <Text style={[styles.desc, { color: t.textSecondary }]}>
          {message ?? '네트워크를 확인해 주세요.'}
        </Text>
        {lastUpdatedAt ? (
          <Text style={[styles.updated, { color: t.textTertiary }]}>
            마지막 갱신: {lastUpdatedAt}
          </Text>
        ) : null}
        <View style={styles.actions}>
          <CTAButton t={t} variant="primary" onPress={handleRetry}>
            다시 시도
          </CTAButton>
        </View>
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
  icon: { fontSize: 40 },
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
  updated: {
    fontSize: 12,
  },
  actions: {
    alignSelf: 'stretch',
    gap: 8,
    marginTop: 8,
  },
});
