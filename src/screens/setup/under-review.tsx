import React, { FC } from 'react';
import { Image, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { PrimaryButton, T } from '../../components/ui';
import { useLanguage } from '../../i18n';
import { useAppNavigation } from '../../navigation/types';
import { useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/thunks';
import { COLORS } from '../../theme';

const ART_ASPECT = 174 / 132;

const WaveBackground: FC<{ width: number; height: number }> = ({ width, height }) => (
  <Svg
    style={StyleSheet.absoluteFill}
    width={width}
    height={height}
    viewBox="0 0 390 844"
    preserveAspectRatio="none"
  >
    <Defs>
      <LinearGradient id="reviewBg" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#E9DCD3" />
        <Stop offset="0.45" stopColor="#F7EEE8" />
        <Stop offset="0.75" stopColor="#F3E7DF" />
        <Stop offset="1" stopColor="#E4CDC7" />
      </LinearGradient>
    </Defs>
    <Rect width={390} height={844} fill="url(#reviewBg)" />
    <Path d="M0 120C90 200 170 210 240 130S350 40 390 30V0H0Z" fill="#FFFFFF" fillOpacity={0.14} />
    <Path d="M60 170C190 220 300 90 390 96" stroke="#FFFFFF" strokeOpacity={0.55} fill="none" />
    <Path d="M0 620C110 640 170 720 270 670S360 560 390 520V844H0Z" fill="#E4C6C0" fillOpacity={0.3} />
    <Path d="M0 650C130 650 240 760 390 770" stroke="#FFFFFF" strokeOpacity={0.5} fill="none" />
  </Svg>
);

export const UnderReviewScreen: FC = () => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { t } = useLanguage();
  const navigation = useAppNavigation();
  const dispatch = useAppDispatch();
  const artWidth = width * 0.68;

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <WaveBackground width={width} height={height} />
      <View style={styles.center}>
        <Image
          source={require('../../assets/images/under-review.png')}
          style={{ width: artWidth, height: artWidth / ART_ASPECT }}
          resizeMode="contain"
        />
        <T style={styles.title}>{t('review.title')}</T>
        <T style={styles.subtitle}>{t('review.subtitle')}</T>
        <PrimaryButton
          label={t('review.explore')}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })}
          style={styles.button}
        />
        <TouchableOpacity
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => dispatch(logout())}
          style={styles.logout}
        >
          <T style={styles.logoutLabel}>{t('review.logout')}</T>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5EBE4' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  title: { fontSize: 30, lineHeight: 39, textAlign: 'center', marginTop: 28 },
  subtitle: { fontSize: 13, color: COLORS.muted, textAlign: 'center', marginTop: 10 },
  button: { alignSelf: 'stretch', marginTop: 20 },
  logout: { marginTop: 16, padding: 8 },
  logoutLabel: { fontSize: 14, color: COLORS.rose },
});
