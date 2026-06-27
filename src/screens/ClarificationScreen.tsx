// ClarificationScreen — REC210 되물음 (멀티턴)
import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colorDark } from '../theme/tokens';
import type { RootStackParamList } from '../types/hospital';
import { AppHeader, SectionLabel, Chip, CTAButton } from '../components';

type Props = NativeStackScreenProps<RootStackParamList, 'ClarificationScreen'>;

export default function ClarificationScreen({ navigation, route }: Props) {
  const t = colorDark;
  const { question, candidates, retry } = route.params;

  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [freeText, setFreeText] = useState('');

  const selectCandidate = (c: string) => {
    setSelectedCandidate((prev) => (prev === c ? null : c));
    setFreeText('');
  };

  const onChangeFree = (v: string) => {
    setFreeText(v);
    if (v) setSelectedCandidate(null);
  };

  const handleConfirm = () => {
    const rawQuery = selectedCandidate ?? freeText.trim();
    if (!rawQuery) return;
    const combined = retry.rawQuery ? `${retry.rawQuery} / ${rawQuery}` : rawQuery;
    // rotateSessionId 호출 안 함 → 기존 sessionId 유지(멀티턴 연결)
    navigation.replace('Loading', {
      symptom: retry.symptom,
      severity: retry.severity,
      rawQuery: combined,
    });
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.bgPage }]} edges={['top']}>
      <AppHeader t={t} onBack={() => navigation.goBack()} title="추가 확인" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.questionBox, { backgroundColor: t.surface, borderColor: t.border }]}>
          <Text style={[styles.question, { color: t.textPrimary }]}>{question}</Text>
        </View>

        {candidates.length > 0 && (
          <View style={styles.section}>
            <SectionLabel t={t}>선택지</SectionLabel>
            <View style={styles.chips}>
              {candidates.map((c) => (
                <Chip
                  key={c}
                  t={t}
                  selected={selectedCandidate === c}
                  onPress={() => selectCandidate(c)}
                >
                  {c}
                </Chip>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <SectionLabel t={t}>직접 입력 (선택)</SectionLabel>
          <TextInput
            style={[styles.input, { color: t.textPrimary, backgroundColor: t.surface, borderColor: t.border }]}
            placeholder="추가 정보를 입력하세요"
            placeholderTextColor={t.textTertiary}
            value={freeText}
            onChangeText={onChangeFree}
            maxLength={200}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CTAButton t={t} variant="primary" onPress={handleConfirm}>
          병원 다시 찾기
        </CTAButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  questionBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  question: {
    fontSize: 15,
    lineHeight: 22,
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
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
