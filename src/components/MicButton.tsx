// MicButton — 62px 원형 PTT 버튼 + pulse
import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import type { ColorTokens } from '../theme/tokens';

type Props = {
  t: ColorTokens;
  listening?: boolean;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  onLongPress?: () => void;
  label?: string;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: 'button';
};

export default function MicButton({
  t,
  listening = true,
  onPress,
  onPressIn,
  onPressOut,
  onLongPress,
  label = '듣는 중…',
  accessible = true,
  accessibilityLabel = '마이크 누르고 있는 동안 음성 입력',
  accessibilityRole = 'button',
}: Props) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (listening) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.3, duration: 800, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulse.setValue(1);
    }
  }, [listening, pulse]);

  return (
    <View style={styles.wrap}>
      <View style={styles.buttonArea}>
        {listening && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.pulse,
              {
                borderColor: t.infoBorder,
                transform: [{ scale: pulse }],
              },
            ]}
          />
        )}
        <Pressable
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          onLongPress={onLongPress}
          accessible={accessible}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole={accessibilityRole}
          style={[styles.button, { backgroundColor: t.infoBg, borderColor: t.infoBorder }]}
        >
          <Text style={styles.glyph}>🎤</Text>
        </Pressable>
      </View>
      {listening && (
        <View style={styles.labelRow}>
          <View style={[styles.smallDot, { backgroundColor: t.infoText }]} />
          <Text style={[styles.label, { color: t.infoText }]}>{label}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 12,
  },
  buttonArea: {
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    width: 78,
    height: 78,
    borderRadius: 999,
    borderWidth: 2,
    top: -8,
    left: -8,
  },
  button: {
    width: 62,
    height: 62,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    fontSize: 24,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  smallDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  label: {
    fontSize: 13,
  },
});
