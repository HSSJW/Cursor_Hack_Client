// ConfirmDialog — 전화/내비 "원터치+확인" Modal
import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import type { ColorTokens } from '../theme/tokens';
import CTAButton from './CTAButton';

type Kind = 'call' | 'navi' | null;

type Props = {
  t: ColorTokens;
  visible: boolean;
  kind: Kind;
  hospital: { name: string; distance?: string } | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmDialog({
  t,
  visible,
  kind,
  hospital,
  onCancel,
  onConfirm,
}: Props) {
  if (!kind || !hospital) return null;

  const title = kind === 'call' ? '전화 연결' : '길찾기 시작';
  const detail =
    kind === 'call'
      ? `${hospital.name} 응급실`
      : `${hospital.name}${hospital.distance ? ` · ${hospital.distance}` : ''}`;
  const confirmLabel = kind === 'call' ? '연결' : '시작';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable
          style={[styles.sheet, { backgroundColor: t.bgPage, borderColor: t.border }]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={[styles.title, { color: t.textPrimary }]}>{title}</Text>
          <Text style={[styles.detail, { color: t.textSecondary }]}>{detail}</Text>
          <View style={styles.buttons}>
            <CTAButton t={t} variant="secondary" onPress={onCancel} style={styles.btn}>
              취소
            </CTAButton>
            <CTAButton t={t} variant="primary" onPress={onConfirm} style={styles.btn}>
              {confirmLabel}
            </CTAButton>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
  },
  detail: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  btn: {
    flex: 1,
  },
});
