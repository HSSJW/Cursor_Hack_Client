// ChatBubble — 음성 화면 말풍선
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ColorTokens } from '../theme/tokens';

type Role = 'agent' | 'user';

type Props = {
  t: ColorTokens;
  children: React.ReactNode;
  role?: Role;
};

export default function ChatBubble({ t, children, role = 'agent' }: Props) {
  const isUser = role === 'user';
  return (
    <View style={[styles.wrap, { alignItems: isUser ? 'flex-end' : 'flex-start' }]}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isUser ? t.infoBg : t.surface,
            borderColor: isUser ? t.infoBorder : t.border,
          },
        ]}
      >
        <Text style={[styles.text, { color: isUser ? t.infoText : t.textPrimary }]}>
          {children}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  bubble: {
    maxWidth: 232,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
});
