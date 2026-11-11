import React, { FC } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { BellIcon } from '../../components/icons';
import { PartnerIdentity, PortalScreen, SectionTitle } from '../../components/portal';
import { ServiceCard } from '../../components/service-card';
import { OutlineButton, T, useComingSoon } from '../../components/ui';
import { OVERVIEW_STATS, UNREAD_NOTIFICATIONS } from '../../data/portal';
import { useAppNavigation } from '../../navigation/types';
import { useBusinessSetup } from '../../state/setup';
import { useLanguage } from '../../i18n';
import { COLORS } from '../../theme';

export const OverviewScreen: FC = () => {
  const { t, row } = useLanguage();
  const comingSoon = useComingSoon();
  const navigation = useAppNavigation();
  const services = useBusinessSetup()?.services ?? [];

  return (
    <PortalScreen>
      <View style={[styles.header, { flexDirection: row }]}>
        <PartnerIdentity />
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t('portal.notifications')}
          onPress={comingSoon}
          style={styles.bell}
        >
          <BellIcon size={20} />
          <View style={styles.badge}>
            <T weight="bold" style={styles.badgeText}>
              {UNREAD_NOTIFICATIONS}
            </T>
          </View>
        </TouchableOpacity>
      </View>

      <View style={[styles.stats, { flexDirection: row }]}>
        {OVERVIEW_STATS.map(stat => (
          <View key={stat.id} style={styles.stat}>
            <T style={styles.statLabel}>{t(stat.label)}</T>
            <T weight="semibold" style={styles.statValue}>
              {stat.value}
            </T>
            {stat.caption ? (
              <T style={styles.statCaption}>{t(stat.caption, { n: stat.captionCount ?? 0 })}</T>
            ) : null}
          </View>
        ))}
      </View>

      <SectionTitle>{t('overview.services')}</SectionTitle>
      {services.slice(0, 3).map(service => (
        <ServiceCard key={service.id} service={service} />
      ))}
      {services.length === 0 ? (
        <OutlineButton
          label={t('portalServices.add')}
          onPress={() => navigation.navigate('ServiceForm')}
          style={styles.addService}
        />
      ) : null}

      <SectionTitle>{t('overview.quickAction')}</SectionTitle>
      <View style={[styles.quick, { flexDirection: row }]}>
        {(['overview.viewEarnings', 'overview.timeOff'] as const).map(label => (
          <OutlineButton
            key={label}
            label={t(label)}
            onPress={comingSoon}
            color={COLORS.muted}
            borderColor={COLORS.hairline}
            weight="regular"
            style={styles.quickButton}
          />
        ))}
      </View>
    </PortalScreen>
  );
};

const styles = StyleSheet.create({
  header: { alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  bell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 10, lineHeight: 13, color: COLORS.white, textAlign: 'center' },
  stats: { flexWrap: 'wrap', gap: 10, marginTop: 20 },
  stat: {
    flexGrow: 1,
    flexBasis: '45%',
    minHeight: 92,
    padding: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    backgroundColor: COLORS.white,
  },
  statLabel: { fontSize: 10, letterSpacing: 0.4, color: COLORS.rose },
  statValue: { fontSize: 21, marginTop: 6 },
  statCaption: { fontSize: 10, color: COLORS.muted, marginTop: 6 },
  addService: { marginTop: 12 },
  quick: { gap: 10, marginTop: 12 },
  quickButton: { flex: 1, height: 52, borderRadius: 14 },
});
