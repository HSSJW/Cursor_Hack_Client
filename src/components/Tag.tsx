// Tag — small pill
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ColorTokens } from '../theme/tokens';

type Kind = 'success' | 'warning' | 'danger' | 'info' | 'muted';

type Props = {
  t: ColorTokens;
  children: React.ReactNode;
  kind?: Kind;
  leading?: React.ReactNode;
};

export default function Tag({ t, children, kind = 'success', leading }: Props) {
  const map: Record<
    Exclude<Kind, 'muted'>,
    { bg: string; fg: string; border: string }
  > = {
    success: { bg: t.successBg, fg: t.successText, border: t.successBorder },
    warning: { bg: t.warningBg, fg: t.warningText, border: t.warningBorder },
    danger: { bg: t.dangerBg, fg: t.dangerText, border: t.dangerBorder },
    info: { bg: t.infoBg, fg: t.infoText, border: t.infoBorder },
  };

  const isMuted = kind === 'muted';
  const c = isMuted
    ? { bg: 'transparent', fg: t.textTertiary, border: t.border }
    : map[kind];

  return (
    <View style={[styles.tag, { backgroundColor: c.bg, borderColor: c.border }]}>
      {leading}
      <Text
        style={[
          styles.label,
          { color: c.fg },
          isMuted && styles.muted,
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
  },
  muted: {
    textDecorationLine: 'line-through',
  },
});
