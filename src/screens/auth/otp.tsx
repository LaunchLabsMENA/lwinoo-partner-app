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
import { errorMessage, retryAfterSeconds } from '../../api/errors';
import { routeFor } from '../../navigation/route-for';
import { RootStackParamList, useAppNavigation } from '../../navigation/types';
import { useSetup } from '../../state/setup';
import { useAppDispatch } from '../../store/hooks';
import { requestOtp, verifyOtp } from '../../store/thunks';
import { COLORS } from '../../theme';

const CODE_LENGTH = 4;
const RESEND_SECONDS = 60;

export const OtpScreen: FC = () => {
  const navigation = useAppNavigation();
  const { params } = useRoute<RouteProp<RootStackParamList, 'Otp'>>();
  const insets = useSafeAreaInsets();
  const { t, row } = useLanguage();
  const inputRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [showError, setShowError] = useState(false);
  const [failure, setFailure] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { load } = useSetup();
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
    setFailure('');
  };

  const onVerify = async () => {
    if (loading) {
      return;
    }
    if (code.length !== CODE_LENGTH) {
      setShowError(true);
      return;
    }
    setLoading(true);
    try {
      const session = await dispatch(
        verifyOtp({ method: params.channel, target: params.target, code }),
      ).unwrap();
      load(session.user.onboarding);
      navigation.reset({ index: 0, routes: [{ name: routeFor(session.user) }] });
    } catch (problem) {
      setCode('');
      setFailure(errorMessage(problem, t));
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setFailure('');
    try {
      const sent = await dispatch(
        requestOtp({ method: params.channel, target: params.target }),
      ).unwrap();
      setSeconds(sent.resendAfterSeconds);
    } catch (problem) {
      const wait = retryAfterSeconds(problem);
      if (wait) {
        setSeconds(Math.min(wait, RESEND_SECONDS));
      }
      setFailure(errorMessage(problem, t));
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader title={t('otp.header')} showLanguage />
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
        {failure ? <T style={styles.error}>{failure}</T> : null}

        <PrimaryButton
          label={t('otp.verify')}
          onPress={onVerify}
          loading={loading}
          style={styles.verify}
        />

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
              onPress={onResend}
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
