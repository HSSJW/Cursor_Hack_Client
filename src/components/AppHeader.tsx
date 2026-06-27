// AppHeader — 화면 헤더
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { ColorTokens } from '../theme/tokens';

type TitleSize = 'h1' | 'h2' | 'title';

type Props = {
  t: ColorTokens;
  onBack?: () => void;
  title: string;
  titleSize?: TitleSize;
  trailing?: React.ReactNode;
};

const fontSizeMap: Record<TitleSize, number> = { h1: 22, h2: 18, title: 16 };

export default function AppHeader({ t, onBack, title, titleSize = 'h2', trailing }: Props) {
  return (
    <View style={styles.header}>
      {onBack && (
        <Pressable onPress={onBack} hitSlop={8}>
          <Text style={[styles.back, { color: t.textPrimary }]}>‹</Text>
        </Pressable>
      )}
      <Text
        style={[styles.title, { color: t.textPrimary, fontSize: fontSizeMap[titleSize] }]}
        numberOfLines={1}
      >
        {title}
      </Text>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  back: {
    fontSize: 20,
  },
  title: {
    flex: 1,
    fontWeight: '500',
  },
});
