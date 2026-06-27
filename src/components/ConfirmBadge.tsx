// ConfirmBadge — 수용 확인 인라인 뱃지
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ColorTokens } from '../theme/tokens';

type Status = 'confirmed' | 'unconfirmed';

type Props = {
  t: ColorTokens;
  status?: Status;
};

export default function ConfirmBadge({ t, status = 'confirmed' }: Props) {
  const confirmed = status === 'confirmed';
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: confirmed ? t.successBg : 'transparent',
          borderColor: confirmed ? t.successBorder : t.border,
        },
      ]}
    >
      <Text style={[styles.glyph, { color: confirmed ? t.successText : t.textTertiary }]}>
        {confirmed ? '✓' : '○'}
      </Text>
      <Text style={[styles.label, { color: confirmed ? t.successText : t.textTertiary }]}>
        {confirmed ? '수용 확인됨' : '확인 필요'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  glyph: {
    fontSize: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
  },
});
