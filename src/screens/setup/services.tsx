import React, { FC } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { SetupScaffold } from '../../components/setup-scaffold';
import { OutlineButton, PrimaryButton, T, useComingSoon } from '../../components/ui';
import { MY_SERVICES } from '../../data/setup';
import { useLanguage } from '../../i18n';
import { useAppNavigation } from '../../navigation/types';
import { toggleItem, useSetup } from '../../state/setup';
import { COLORS } from '../../theme';

export const ServicesScreen: FC = () => {
  const navigation = useAppNavigation();
  const { t, row } = useLanguage();
  const { form, update } = useSetup();
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
            onPress={() => navigation.navigate('SetupDocuments')}
          />
        </>
      }
    >
      {MY_SERVICES.map(service => {
        const active = !form.inactiveServices.includes(service.id);
        return (
          <View key={service.id} style={styles.card}>
            <View style={[styles.cardTop, { flexDirection: row }]}>
              <Image source={service.image} style={styles.image} />
              <View style={styles.flex}>
                <T weight="medium" style={styles.title}>
                  {t(service.title)}
                </T>
                <T style={styles.subtitle}>{t(service.subtitle)}</T>
                <View style={[styles.tags, { flexDirection: row }]}>
                  <View style={styles.tag}>
                    <T style={styles.tagLabel}>{t('services.ritual')}</T>
                  </View>
                  <View style={styles.tag}>
                    <T style={styles.tagLabel}>{t('services.more')}</T>
                  </View>
                </View>
              </View>
            </View>
            <View style={[styles.actions, { flexDirection: row }]}>
              <OutlineButton
                label={t('services.edit')}
                onPress={comingSoon}
                color={COLORS.muted}
                backgroundColor={COLORS.background}
                style={styles.flex}
              />
              <OutlineButton
                label={t(active ? 'services.active' : 'services.inactive')}
                onPress={() =>
                  update({ inactiveServices: toggleItem(form.inactiveServices, service.id) })
                }
                color={active ? COLORS.activeBorder : COLORS.muted}
                borderColor={active ? COLORS.activeBorder : COLORS.hairline}
                backgroundColor={active ? COLORS.activeFill : COLORS.white}
                weight="bold"
                style={styles.flex}
              />
            </View>
          </View>
        );
      })}
    </SetupScaffold>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  addService: { height: 54, borderRadius: 27, marginBottom: 12 },
  card: {
    padding: 12,
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    backgroundColor: COLORS.white,
  },
  cardTop: { gap: 12 },
  image: { width: 86, height: 86, borderRadius: 10 },
  title: { fontSize: 17 },
  subtitle: { fontSize: 12, color: COLORS.muted, marginTop: 4 },
  tags: { gap: 6, marginTop: 10, flexWrap: 'wrap' },
  tag: {
    backgroundColor: COLORS.chip,
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  tagLabel: { fontSize: 10.5 },
  actions: { gap: 8, marginTop: 12 },
});
