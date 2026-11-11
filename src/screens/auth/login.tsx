import React, { FC, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppleIcon, GoogleIcon } from '../../components/icons';
import {
  FieldLabel,
  Input,
  LanguageToggle,
  PhoneInput,
  PrimaryButton,
  T,
  useComingSoon,
} from '../../components/ui';
import { errorMessage } from '../../api/errors';
import { useLanguage } from '../../i18n';
import { TKey } from '../../i18n/translations';
import { useAppNavigation } from '../../navigation/types';
import { useAppDispatch } from '../../store/hooks';
import { requestOtp } from '../../store/thunks';
import { COLORS } from '../../theme';

type Channel = 'phone' | 'email';

const TABS: { id: Channel; label: TKey }[] = [
  { id: 'phone', label: 'login.phoneTab' },
  { id: 'email', label: 'login.emailTab' },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toSaudiE164 = (raw: string): string | null => {
  const digits = raw
    .replace(/\D/g, '')
    .replace(/^(00)?966/, '')
    .replace(/^0+/, '');
  return /^5\d{8}$/.test(digits) ? `+966${digits}` : null;
};

export const LoginScreen: FC = () => {
  const navigation = useAppNavigation();
  const insets = useSafeAreaInsets();
  const { t, row, isRTL } = useLanguage();
  const [channel, setChannel] = useState<Channel>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<TKey | null>(null);
  const [failure, setFailure] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const comingSoon = useComingSoon();

  const selectChannel = (next: Channel) => {
    setChannel(next);
    setError(null);
    setFailure('');
  };

  const onContinue = async () => {
    if (loading) {
      return;
    }
    const target = channel === 'phone' ? toSaudiE164(phone) : email.trim().toLowerCase();
    if (!target || (channel === 'email' && !EMAIL_PATTERN.test(target))) {
      setError(channel === 'phone' ? 'login.errorPhone' : 'login.errorEmail');
      return;
    }
    setError(null);
    setFailure('');
    setLoading(true);
    try {
      await dispatch(requestOtp({ method: channel, target })).unwrap();
      navigation.navigate('Otp', { channel, target });
    } catch (problem) {
      setFailure(errorMessage(problem, t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logo}>
          <Image
            source={require('../../assets/logo/lwinoo-logo.jpg')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <T heading style={styles.title}>
          {t('login.title')}
        </T>
        <T style={styles.subtitle}>{t('login.subtitle')}</T>

        <View style={[styles.segment, { flexDirection: row }]}>
          {TABS.map(tab => {
            const selected = tab.id === channel;
            return (
              <TouchableOpacity
                key={tab.id}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                activeOpacity={0.8}
                onPress={() => selectChannel(tab.id)}
                style={[styles.segmentItem, selected && styles.segmentItemSelected]}
              >
                <T style={[styles.segmentLabel, !selected && styles.segmentLabelIdle]}>
                  {t(tab.label)}
                </T>
              </TouchableOpacity>
            );
          })}
        </View>

        {channel === 'phone' ? (
          <>
            <FieldLabel style={styles.fieldLabel}>{t('login.mobileLabel')}</FieldLabel>
            <PhoneInput value={phone} onChangeText={setPhone} />
          </>
        ) : (
          <>
            <FieldLabel style={styles.fieldLabel}>{t('login.emailLabel')}</FieldLabel>
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="yourmail@gmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </>
        )}
        {error ? <T style={styles.error}>{t(error)}</T> : null}
        {failure ? <T style={styles.error}>{failure}</T> : null}

        <PrimaryButton
          label={t('common.continue')}
          onPress={onContinue}
          loading={loading}
          style={styles.continue}
        />

        <View style={[styles.dividerRow, { flexDirection: row }]}>
          <View style={styles.dividerLine} />
          <T style={styles.dividerText}>{t('login.or')}</T>
          <View style={styles.dividerLine} />
        </View>

        <View style={[styles.socialRow, { flexDirection: row }]}>
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.8}
            onPress={comingSoon}
            style={styles.social}
          >
            <GoogleIcon />
            <T style={styles.socialLabel}>{t('login.google')}</T>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.8}
            onPress={comingSoon}
            style={styles.social}
          >
            <AppleIcon />
            <T style={styles.socialLabel}>{t('login.apple')}</T>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <LanguageToggle
        style={[styles.language, { top: insets.top + 8 }, isRTL ? styles.languageRTL : styles.languageLTR]}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.white },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20 },
  language: { position: 'absolute' },
  languageLTR: { right: 20 },
  languageRTL: { left: 20 },
  logo: { alignItems: 'center', marginBottom: 28 },
  logoImage: { width: 72, height: 72, borderRadius: 16 },
  title: { fontSize: 28, textAlign: 'center' },
  subtitle: { fontSize: 13, color: COLORS.muted, textAlign: 'center', marginTop: 8 },
  segment: {
    marginTop: 26,
    height: 52,
    padding: 4,
    gap: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.hairline,
  },
  segmentItem: { flex: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  segmentItemSelected: { backgroundColor: COLORS.roseSoft },
  segmentLabel: { fontSize: 14 },
  segmentLabelIdle: { color: COLORS.muted },
  fieldLabel: { marginTop: 24, color: COLORS.muted },
  error: { color: COLORS.error, fontSize: 12, marginTop: 8 },
  continue: { marginTop: 28 },
  dividerRow: { alignItems: 'center', gap: 10, marginTop: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.hairline },
  dividerText: { fontSize: 12 },
  socialRow: { gap: 8, marginTop: 20 },
  social: {
    flex: 1,
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  socialLabel: { fontSize: 16 },
});
