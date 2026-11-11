import React, { FC } from 'react';
import { StyleSheet } from 'react-native';
import { ServiceCard } from '../../components/service-card';
import { SetupScaffold } from '../../components/setup-scaffold';
import { OutlineButton, PrimaryButton, useComingSoon } from '../../components/ui';
import { MY_SERVICES } from '../../data/setup';
import { useLanguage } from '../../i18n';
import { useDraftSync } from '../../state/use-draft';
import { useAppNavigation } from '../../navigation/types';

export const ServicesScreen: FC = () => {
  const navigation = useAppNavigation();
  const saveDraft = useDraftSync();
  const { t } = useLanguage();
  const comingSoon = useComingSoon();

  return (
    <SetupScaffold
      step={5}
      header={t('services.header')}
      title={t('services.title')}
      footer={
        <>
          <OutlineButton
            label={t('services.add')}
            onPress={comingSoon}
            style={styles.addService}
          />
          <PrimaryButton
            label={t('common.continue')}
            onPress={() => {
              saveDraft();
              navigation.navigate('SetupDocuments');
            }}
          />
        </>
      }
    >
      {MY_SERVICES.map(service => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </SetupScaffold>
  );
};

const styles = StyleSheet.create({
  addService: { height: 54, borderRadius: 27, marginBottom: 12 },
});
