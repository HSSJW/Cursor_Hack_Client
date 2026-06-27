// LoadingStep — 로딩 단계(+sub-step)
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import type { ColorTokens } from '../theme/tokens';

export interface SubStep {
  text: string;
  status: 'progress' | 'done';
}

type Status = 'done' | 'progress' | 'pending';

type Props = {
  t: ColorTokens;
  status: Status;
  label: string;
  subSteps?: SubStep[];
};

function Spinner({ color, size, duration }: { color: string; size: number; duration: number }) {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin, duration]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        borderWidth: 2,
        borderColor: color,
        borderTopColor: 'transparent',
        transform: [{ rotate }],
      }}
    />
  );
}

function SubStepRow({ t, sub }: { t: ColorTokens; sub: SubStep }) {
  return (
    <View style={styles.subRow}>
      {sub.status === 'progress' ? (
        <Spinner color={t.warningText} size={10} duration={900} />
      ) : (
        <Text style={[styles.subCheck, { color: t.successText }]}>✓</Text>
      )}
      <Text style={[styles.subText, { color: t.textSecondary }]} numberOfLines={1}>
        {sub.text}
      </Text>
    </View>
  );
}

export default function LoadingStep({ t, status, label, subSteps }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View
          style={[
            styles.dot,
            status === 'done' && { backgroundColor: t.successText },
            status === 'progress' && { backgroundColor: t.infoText },
            status === 'pending' && {
              backgroundColor: 'transparent',
              borderWidth: 1.5,
              borderColor: t.border,
            },
          ]}
        >
          {status === 'done' && (
            <Text style={[styles.check, { color: t.bgPage }]}>✓</Text>
          )}
          {status === 'progress' && (
            <Spinner color={t.bgPage} size={14} duration={1000} />
          )}
        </View>
        <Text
          style={[
            styles.label,
            { color: status === 'pending' ? t.textTertiary : t.textPrimary },
            status === 'progress' && styles.labelActive,
          ]}
        >
          {label}
        </Text>
      </View>
      {subSteps && subSteps.length > 0 && (
        <View style={styles.subList}>
          {subSteps.map((sub, i) => (
            <SubStepRow key={i} t={t} sub={sub} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    fontSize: 10,
    fontWeight: '700',
  },
  label: {
    fontSize: 15,
  },
  labelActive: {
    fontWeight: '500',
  },
  subList: {
    paddingLeft: 30,
    gap: 2,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subCheck: {
    fontSize: 10,
    width: 10,
    textAlign: 'center',
  },
  subText: {
    fontSize: 12,
  },
});
