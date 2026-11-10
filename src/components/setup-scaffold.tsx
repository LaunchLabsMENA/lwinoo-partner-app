import React, { FC, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../i18n';
import { COLORS, FONTS } from '../theme';
import { BackIcon } from './icons';
import { T } from './ui';

export const TOTAL_SETUP_STEPS = 6;

export const ScreenHeader: FC<{ title: string; showLanguage?: boolean }> = ({
  title,
  showLanguage,
}) => {
  const navigation = useNavigation();
  const { isRTL, row, toggle } = useLanguage();
  return (
    <View style={[styles.header, { flexDirection: row }]}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={12}
        onPress={() => navigation.goBack()}
        style={styles.headerSide}
      >
        <View style={isRTL ? styles.flipped : undefined}>
          <BackIcon />
        </View>
      </TouchableOpacity>
      <T weight="semibold" style={styles.headerTitle}>
        {title}
      </T>
      <View style={[styles.headerSide, isRTL ? styles.alignStart : styles.alignEnd]}>
        {showLanguage ? (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={toggle}
            style={styles.languagePill}
          >
            <Text style={[styles.languageText, { fontFamily: isRTL ? FONTS.body.medium : FONTS.arabic.medium }]}>
              {isRTL ? 'EN' : 'عربي'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

export const SetupScaffold: FC<{
  step: number;
  header: string;
  title: string;
  titleAlign?: 'left' | 'center';
  footer: ReactNode;
  footerTop?: ReactNode;
  children: ReactNode;
}> = ({ step, header, title, titleAlign = 'center', footer, footerTop, children }) => {
  const insets = useSafeAreaInsets();
  const { t, isRTL, row } = useLanguage();
  const resolvedAlign = titleAlign === 'center' ? 'center' : isRTL ? 'right' : 'left';

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader title={header} showLanguage />
        <View style={styles.progressWrap}>
          <T style={styles.stepLabel}>{t('setup.step', { n: step, total: TOTAL_SETUP_STEPS })}</T>
          <View style={[styles.bars, { flexDirection: row }]}>
            {Array.from({ length: TOTAL_SETUP_STEPS }).map((_, index) => (
              <View key={index} style={[styles.bar, index < step && styles.barDone]} />
            ))}
          </View>
        </View>
      </View>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <T heading style={[styles.title, { textAlign: resolvedAlign }]}>
          {title}
        </T>
        {children}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        {footerTop}
        {footer}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  header: {
    height: 52,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerSide: { width: 70, justifyContent: 'center', alignItems: 'flex-start' },
  alignEnd: { alignItems: 'flex-end' },
  alignStart: { alignItems: 'flex-start' },
  flipped: { transform: [{ scaleX: -1 }] },
  headerTitle: { flex: 1, fontSize: 17, textAlign: 'center' },
  languagePill: {
    height: 30,
    minWidth: 58,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageText: { fontSize: 13, color: COLORS.espresso },
  progressWrap: { paddingHorizontal: 20, marginTop: 4 },
  stepLabel: { fontSize: 12, color: COLORS.muted, marginBottom: 8 },
  bars: { gap: 8 },
  bar: { flex: 1, height: 3, borderRadius: 2, backgroundColor: COLORS.roseSoft },
  barDone: { backgroundColor: COLORS.rose },
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 28 },
  title: { fontSize: 24, marginBottom: 12 },
  footer: {
    backgroundColor: '#FEFEFE',
    paddingHorizontal: 20,
    paddingTop: 14,
  },
});
