// SectionLabel — 섹션 소제목
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ColorTokens } from '../theme/tokens';

type Props = {
  t: ColorTokens;
  children: React.ReactNode;
  action?: React.ReactNode;
};

export default function SectionLabel({ t, children, action }: Props) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: t.textSecondary }]}>{children}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
});
