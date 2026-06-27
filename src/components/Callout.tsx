// Callout — 안내 박스
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ColorTokens } from '../theme/tokens';

type Kind = 'warning' | 'info' | 'surface';

type Props = {
  t: ColorTokens;
  children: React.ReactNode;
  kind?: Kind;
};

export default function Callout({ t, children, kind = 'warning' }: Props) {
  const c =
    kind === 'warning'
      ? { bg: t.warningBg, fg: t.warningText, border: t.warningBorder }
      : kind === 'info'
        ? { bg: t.infoBg, fg: t.infoText, border: t.infoBorder }
        : { bg: t.surface, fg: t.textPrimary, border: t.border };

  return (
    <View style={[styles.box, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Text style={[styles.glyph, { color: c.fg }]}>⚠</Text>
      <Text style={[styles.text, { color: c.fg }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 12,
    padding: 11,
    borderWidth: 1,
  },
  glyph: {
    fontSize: 14,
  },
  text: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
