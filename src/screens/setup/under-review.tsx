import React, { FC, useCallback } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { PrimaryButton, T } from '../../components/ui';
import { useLanguage } from '../../i18n';
import { TKey } from '../../i18n/translations';
import { resetTo, setupRoutes } from '../../navigation/route-for';
import { useAppNavigation } from '../../navigation/types';
import { useBusinessSetup } from '../../state/setup';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loadBusiness, logout } from '../../store/thunks';
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

/** The application's status: in review, needs changes, or suspended. Read fresh on every visit. */
export const UnderReviewScreen: FC = () => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { t } = useLanguage();
  const navigation = useAppNavigation();
  const dispatch = useAppDispatch();
  const business = useBusinessSetup()?.business;
  const summary = useAppSelector(state => state.session.account?.business);
  const [refreshing, setRefreshing] = React.useState(false);
  const artWidth = width * 0.68;

  const refresh = useCallback(async () => {
    const setup = await dispatch(loadBusiness()).unwrap().catch(() => null);
    if (setup?.business?.status === 'APPROVED') {
      navigation.reset(resetTo([{ name: 'Main' }]));
    }
  }, [dispatch, navigation]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const status = business?.status ?? summary?.status ?? 'PENDING_REVIEW';
  const reason = business?.rejectionReason ?? business?.statusReason ?? summary?.rejectionReason;
  const copy: { title: TKey; subtitle: TKey } =
    status === 'REJECTED'
      ? { title: 'review.rejectedTitle', subtitle: 'review.rejectedSubtitle' }
      : status === 'SUSPENDED'
      ? { title: 'review.suspendedTitle', subtitle: 'review.suspendedSubtitle' }
      : status === 'DRAFT'
      ? { title: 'review.draftTitle', subtitle: 'review.draftSubtitle' }
      : { title: 'review.title', subtitle: 'review.subtitle' };

  return (
    <View style={styles.root}>
      <WaveBackground width={width} height={height} />
      <ScrollView
        contentContainerStyle={[
          styles.center,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await refresh();
              setRefreshing(false);
            }}
          />
        }
      >
        <Image
          source={require('../../assets/images/under-review.png')}
          style={{ width: artWidth, height: artWidth / ART_ASPECT }}
          resizeMode="contain"
        />
        <T style={styles.title}>{t(copy.title)}</T>
        <T style={styles.subtitle}>{t(copy.subtitle)}</T>
        {reason && (status === 'REJECTED' || status === 'SUSPENDED') ? (
          <View style={styles.reasonBox}>
            <T style={styles.reason}>{reason}</T>
          </View>
        ) : null}

        {status === 'REJECTED' || status === 'DRAFT' ? (
          <PrimaryButton
            label={t(status === 'DRAFT' ? 'review.continueSetup' : 'review.fix')}
            onPress={() =>
              navigation.reset(
                resetTo(status === 'DRAFT' ? setupRoutes(business?.setupStep) : setupRoutes(null)),
              )
            }
            style={styles.button}
          />
        ) : status === 'PENDING_REVIEW' ? (
          <PrimaryButton
            label={t('review.explore')}
            onPress={() => navigation.reset(resetTo([{ name: 'Main' }]))}
            style={styles.button}
          />
        ) : null}
        <TouchableOpacity
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => dispatch(logout())}
          style={styles.logout}
        >
          <T style={styles.logoutLabel}>{t('review.logout')}</T>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5EBE4' },
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  title: { fontSize: 30, lineHeight: 39, textAlign: 'center', marginTop: 28 },
  subtitle: { fontSize: 13, color: COLORS.muted, textAlign: 'center', marginTop: 10 },
  reasonBox: {
    alignSelf: 'stretch',
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.danger,
    backgroundColor: COLORS.white,
  },
  reason: { fontSize: 13, color: COLORS.danger, textAlign: 'center' },
  button: { alignSelf: 'stretch', marginTop: 20 },
  logout: { marginTop: 16, padding: 8 },
  logoutLabel: { fontSize: 14, color: COLORS.rose },
});
