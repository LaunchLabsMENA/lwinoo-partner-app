import React, { FC, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useLoadCatalog } from '../../components/catalog';
import { ServiceCard } from '../../components/service-card';
import { SetupScaffold } from '../../components/setup-scaffold';
import { OutlineButton, PrimaryButton, T } from '../../components/ui';
import { useLanguage } from '../../i18n';
import { useAppNavigation } from '../../navigation/types';
import { useBusinessSetup } from '../../state/setup';
import { useStepRunner } from '../../state/use-step';
import { useAppDispatch } from '../../store/hooks';
import { loadServices } from '../../store/thunks';
import { COLORS } from '../../theme';

export const ServicesScreen: FC = () => {
  const navigation = useAppNavigation();
  const dispatch = useAppDispatch();
  const { t } = useLanguage();
  const services = useBusinessSetup()?.services ?? [];
  const { failure, setFailure, run } = useStepRunner();
  useLoadCatalog();

  useEffect(() => {
    run(() => dispatch(loadServices()).unwrap());
    // Load once when the step opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onContinue = () => {
    if (!services.some(service => service.isActive)) {
      setFailure(t('services.needOne'));
      return;
    }
    navigation.navigate('SetupDocuments');
  };

  return (
    <SetupScaffold
      step={5}
      error={failure}
      header={t('services.header')}
      title={t('services.title')}
      footer={
        <>
          <OutlineButton
            label={t('services.add')}
            onPress={() => navigation.navigate('ServiceForm')}
            style={styles.addService}
          />
          <PrimaryButton label={t('common.continue')} onPress={onContinue} />
        </>
      }
    >
      {services.length === 0 ? <T style={styles.empty}>{t('services.empty')}</T> : null}
      {services.map(service => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </SetupScaffold>
  );
};

const styles = StyleSheet.create({
  addService: { height: 54, borderRadius: 27, marginBottom: 12 },
  empty: { fontSize: 14, color: COLORS.muted, textAlign: 'center', marginTop: 24 },
});
