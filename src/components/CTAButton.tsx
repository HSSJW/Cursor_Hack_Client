// CTAButton — Primary/Secondary/Mini 버튼
import React from 'react';
import { Pressable, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import type { ColorTokens } from '../theme/tokens';

type Variant = 'primary' | 'secondary' | 'mini';

type Props = {
  t: ColorTokens;
  children: React.ReactNode;
  onPress?: () => void;
  variant?: Variant;
  leading?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function CTAButton({
  t,
  children,
  onPress,
  variant = 'primary',
  leading,
  style,
}: Props) {
  const isMini = variant === 'mini';
  const color =
    variant === 'primary'
      ? { bg: t.infoBg, fg: t.infoText, border: t.infoBorder, pressed: t.infoBorder }
      : variant === 'secondary'
        ? { bg: t.surface, fg: t.textPrimary, border: t.border, pressed: t.surfaceAlt }
        : { bg: 'transparent', fg: t.textPrimary, border: t.border, pressed: t.surfaceAlt };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isMini ? styles.mini : styles.normal,
        {
          backgroundColor: pressed ? color.pressed : color.bg,
          borderColor: color.border,
        },
        isMini && styles.miniFlex,
        style,
      ]}
    >
      {leading}
      <Text
        style={[
          styles.label,
          { color: color.fg, fontSize: isMini ? 12 : 13 },
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
  },
  normal: {
    padding: 11,
    borderRadius: 12,
  },
  mini: {
    padding: 7,
    borderRadius: 8,
  },
  miniFlex: {
    flex: 1,
  },
  label: {
    fontWeight: '500',
    letterSpacing: -0.13,
  },
});
