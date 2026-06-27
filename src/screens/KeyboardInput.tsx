// KeyboardInput — 자유발화/카테고리 칩
import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colorDark } from '../theme/tokens';
import type { RootStackParamList } from '../types/hospital';
import { AppHeader, SectionLabel, Chip, CTAButton } from '../components';
import { rotateSessionId } from '../lib/session';

type Props = NativeStackScreenProps<RootStackParamList, 'KeyboardInput'>;

const CHIPS = ['흉통', '의식저하', '호흡곤란', '외상', '뇌졸중 의심'];

export default function KeyboardInput({ navigation }: Props) {
  const t = colorDark;

  const [selectedChip, setSelectedChip] = useState<string>('흉통');
  const [severity, setSeverity] = useState<'severe' | 'normal'>('severe');
  const [text, setText] = useState('');
  const [freeMode, setFreeMode] = useState(false);
  const [freeText, setFreeText] = useState('');

  const handleSearch = async () => {
    const sessionId = await rotateSessionId();

    if (freeMode) {
      const rawQuery = freeText.trim();
      if (!rawQuery) return;
      navigation.navigate('Loading', { rawQuery, sessionId });
      return;
    }

    const userText = text.trim();
    if (userText) {
      navigation.navigate('Loading', { rawQuery: userText, severity, sessionId });
      return;
    }

    navigation.navigate('Loading', { symptom: selectedChip, severity, sessionId });
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.bgPage }]} edges={['top']}>
      <AppHeader t={t} onBack={() => navigation.goBack()} title="증상 입력" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* 모드 토글 */}
        <View style={[styles.modeToggle, { borderColor: t.border }]}>
          <ModeTab t={t} label="카테고리" active={!freeMode} onPress={() => setFreeMode(false)} />
          <ModeTab t={t} label="자유 입력" active={freeMode} onPress={() => setFreeMode(true)} />
        </View>

        {freeMode ? (
          <View style={styles.section}>
            <SectionLabel t={t}>상황을 자유롭게 입력</SectionLabel>
            <TextInput
              style={[styles.multiline, { color: t.textPrimary, backgroundColor: t.surface, borderColor: t.border }]}
              placeholder="예: 2살 손가락 절단됐어 빨리"
              placeholderTextColor={t.textTertiary}
              value={freeText}
              onChangeText={setFreeText}
              maxLength={300}
              multiline
              autoFocus
            />
            <View style={styles.helperRow}>
              <Text style={[styles.helper, { color: t.textTertiary }]}>
                AI가 증상·중증도를 자동으로 분석합니다
              </Text>
              <Text style={[styles.counter, { color: t.textTertiary }]}>{freeText.length}/300</Text>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <SectionLabel t={t}>빠른 선택</SectionLabel>
              <View style={styles.chips}>
                {CHIPS.map((c) => (
                  <Chip
                    key={c}
                    t={t}
                    selected={selectedChip === c}
                    onPress={() => setSelectedChip(c)}
                  >
                    {c}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <SectionLabel t={t}>직접 입력</SectionLabel>
              <TextInput
                style={[styles.input, { color: t.textPrimary, backgroundColor: t.surface, borderColor: t.border }]}
                placeholder="환자 상태를 입력하세요 (선택)"
                placeholderTextColor={t.textTertiary}
                value={text}
                onChangeText={setText}
                maxLength={200}
              />
              <View style={styles.helperRow}>
                <Text style={[styles.helper, { color: t.textTertiary }]}>한 → 영</Text>
                <Text style={[styles.counter, { color: t.textTertiary }]}>{text.length}/200</Text>
              </View>
            </View>

            <View style={styles.section}>
              <SectionLabel t={t}>중증도</SectionLabel>
              <View style={styles.severityRow}>
                <SeverityTab
                  t={t}
                  label="중증"
                  active={severity === 'severe'}
                  danger
                  onPress={() => setSeverity('severe')}
                />
                <SeverityTab
                  t={t}
                  label="일반"
                  active={severity === 'normal'}
                  onPress={() => setSeverity('normal')}
                />
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <CTAButton t={t} variant="primary" onPress={handleSearch}>
          수용 가능 병원 찾기
        </CTAButton>
      </View>
    </SafeAreaView>
  );
}

function ModeTab({
  t,
  label,
  active,
  onPress,
}: {
  t: typeof colorDark;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Text
      onPress={onPress}
      style={[
        styles.modeTab,
        {
          color: active ? t.infoText : t.textSecondary,
          backgroundColor: active ? t.infoBg : 'transparent',
        },
      ]}
    >
      {label}
    </Text>
  );
}

function SeverityTab({
  t,
  label,
  active,
  danger,
  onPress,
}: {
  t: typeof colorDark;
  label: string;
  active: boolean;
  danger?: boolean;
  onPress: () => void;
}) {
  const activeColor = danger ? t.dangerText : t.infoText;
  const activeBg = danger ? t.dangerBg : t.infoBg;
  const activeBorder = danger ? t.dangerBorder : t.infoBorder;
  return (
    <Text
      onPress={onPress}
      style={[
        styles.severityTab,
        {
          color: active ? activeColor : t.textSecondary,
          backgroundColor: active ? activeBg : 'transparent',
          borderColor: active ? activeBorder : t.border,
        },
      ]}
    >
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 20,
  },
  modeToggle: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  modeTab: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 13,
    fontWeight: '500',
    overflow: 'hidden',
  },
  section: {
    gap: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
  },
  multiline: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 96,
    textAlignVertical: 'top',
  },
  helperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  helper: {
    fontSize: 12,
  },
  counter: {
    fontSize: 12,
  },
  severityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  severityTab: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 14,
    fontWeight: '500',
    overflow: 'hidden',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
