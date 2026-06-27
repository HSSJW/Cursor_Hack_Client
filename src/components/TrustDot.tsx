// TrustDot — 7px 데이터 신선도 점
import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import type { ColorTokens } from '../theme/tokens';

type Kind = 'success' | 'warning' | 'danger' | 'neutral';

type Props = {
  t: ColorTokens;
  kind?: Kind;
  style?: StyleProp<ViewStyle>;
};

export default function TrustDot({ t, kind = 'success', style }: Props) {
  if (kind === 'neutral') {
    return (
      <View
        style={[
          styles.dot,
          { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: t.textTertiary },
          style,
        ]}
      />
    );
  }

  const fill =
    kind === 'warning' ? t.warningText : kind === 'danger' ? t.dangerText : t.successText;

  return <View style={[styles.dot, { backgroundColor: fill }, style]} />;
}

const styles = StyleSheet.create({
  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
  },
});
