import React, { FC, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../components/setup-scaffold';
import { PrimaryButton, T } from '../../components/ui';
import { useLanguage } from '../../i18n';
import { RootStackParamList, useAppNavigation } from '../../navigation/types';
import { COLORS } from '../../theme';

const CODE_LENGTH = 4;
const RESEND_SECONDS = 30;

export const OtpScreen: FC = () => {
  const navigation = useAppNavigation();
  const { params } = useRoute<RouteProp<RootStackParamList, 'Otp'>>();
  const insets = useSafeAreaInsets();
  const { t, row } = useLanguage();
  const inputRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [showError, setShowError] = useState(false);
  const isEmail = params.channel === 'email';

  useEffect(() => {
    if (seconds <= 0) {
      return;
    }
    const id = setTimeout(() => setSeconds(value => value - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  const onChange = (value: string) => {
    setCode(value.replace(/\D/g, '').slice(0, CODE_LENGTH));
    setShowError(false);
  };

  const onVerify = () => {
    if (code.length !== CODE_LENGTH) {
      setShowError(true);
      return;
    }
    navigation.navigate('SetupPartner');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader title={t('otp.header')} />
      <View style={styles.body}>
        <T heading style={styles.title}>
          {t(isEmail ? 'otp.titleEmail' : 'otp.titlePhone')}
        </T>
        <T style={styles.subtitle}>{t(isEmail ? 'otp.subEmail' : 'otp.subPhone')}</T>

        {/* Digits always read left to right, including in Arabic. */}
        <Pressable style={styles.boxes} onPress={() => inputRef.current?.focus()}>
          {Array.from({ length: CODE_LENGTH }).map((_, index) => (
            <View key={index} style={styles.box}>
              <T weight="medium" style={[styles.digit, !code[index] && styles.digitEmpty]}>
                {code[index] ?? '-'}
              </T>
            </View>
          ))}
          <TextInput
            ref={inputRef}
            autoFocus
            value={code}
            onChangeText={onChange}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            maxLength={CODE_LENGTH}
            caretHidden
            accessibilityLabel={t('otp.header')}
            style={styles.hiddenInput}
          />
        </Pressable>
        {showError ? <T style={styles.error}>{t('otp.error')}</T> : null}

        <PrimaryButton label={t('otp.verify')} onPress={onVerify} style={styles.verify} />

        <View style={[styles.resendRow, { flexDirection: row }]}>
          <T style={styles.resendHint}>{t('otp.noCode')}</T>
          {seconds > 0 ? (
            <T weight="bold" style={styles.resend}>
              {t('otp.resendIn', { s: seconds })}
            </T>
          ) : (
            <Pressable
              accessibilityRole="button"
              hitSlop={10}
              onPress={() => setSeconds(RESEND_SECONDS)}
            >
              <T weight="bold" style={styles.resend}>
                {t('otp.resend')}
              </T>
            </Pressable>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.white },
  body: { flex: 1, justifyContent: 'center', paddingHorizontal: 20, paddingBottom: 60 },
  title: { fontSize: 28, textAlign: 'center' },
  subtitle: { fontSize: 13, color: COLORS.muted, textAlign: 'center', marginTop: 8 },
  boxes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
  },
  box: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: { fontSize: 22, textAlign: 'center' },
  digitEmpty: { color: COLORS.placeholder },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.01,
    color: 'transparent',
  },
  error: { color: COLORS.error, fontSize: 12, marginTop: 10, textAlign: 'center' },
  verify: { marginTop: 32 },
  resendRow: { justifyContent: 'center', gap: 4, marginTop: 24 },
  resendHint: { fontSize: 12, color: COLORS.muted },
  resend: { fontSize: 12 },
});
