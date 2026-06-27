// Chip — pill 선택칩
import React from 'react';
import { Pressable, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import type { ColorTokens } from '../theme/tokens';

type Props = {
  t: ColorTokens;
  children: React.ReactNode;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function Chip({ t, children, selected = false, onPress, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          borderColor: selected ? t.infoBorder : t.border,
          backgroundColor: selected ? t.infoBg : 'transparent',
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: selected ? t.infoText : t.textSecondary,
            fontWeight: selected ? '500' : '400',
          },
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    letterSpacing: -0.11,
  },
});
