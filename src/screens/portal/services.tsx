import React, { FC, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { PortalScreen, SearchField, SmallButton } from '../../components/portal';
import { ServiceCard } from '../../components/service-card';
import { T, useComingSoon } from '../../components/ui';
import { MY_SERVICES } from '../../data/setup';
import { useLanguage } from '../../i18n';
import { COLORS } from '../../theme';

export const PortalServicesScreen: FC = () => {
  const { t, row } = useLanguage();
  const comingSoon = useComingSoon();
  const [query, setQuery] = useState('');

  const needle = query.trim().toLowerCase();
  const visible = MY_SERVICES.filter(service =>
    `${t(service.title)} ${t(service.subtitle)}`.toLowerCase().includes(needle),
  );

  return (
    <PortalScreen title={t('portalServices.title')}>
      <SearchField
        placeholder={t('portalServices.search')}
        value={query}
        onChangeText={setQuery}
      />
      <View style={[styles.heading, { flexDirection: row }]}>
        <T weight="medium" style={styles.headingLabel}>
          {t('portalServices.yours')}
        </T>
        <SmallButton label={t('portalServices.add')} onPress={comingSoon} />
      </View>
      {visible.map(service => (
        <ServiceCard key={service.id} service={service} />
      ))}
      {visible.length === 0 ? <T style={styles.empty}>{t('portal.noResults')}</T> : null}
    </PortalScreen>
  );
};

const styles = StyleSheet.create({
  heading: { alignItems: 'center', justifyContent: 'space-between', marginTop: 18 },
  headingLabel: { fontSize: 14 },
  empty: { fontSize: 14, color: COLORS.muted, textAlign: 'center', marginTop: 32 },
});
