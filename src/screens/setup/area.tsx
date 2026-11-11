import React, { FC } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { ServiceLocation } from '../../api/types';
import { LocationPicker } from '../../components/location-picker';
import { SetupScaffold } from '../../components/setup-scaffold';
import { Chip, FieldLabel, PrimaryButton, Radio, T } from '../../components/ui';
import { CITIES, RADII } from '../../data/setup';
import { useLanguage } from '../../i18n';
import { TKey } from '../../i18n/translations';
import { useAppNavigation } from '../../navigation/types';
import { useSetup } from '../../state/setup';
import { useStepRunner } from '../../state/use-step';
import { useAppDispatch } from '../../store/hooks';
import { saveServiceArea } from '../../store/thunks';
import { COLORS } from '../../theme';

const AREA_OPTIONS: { id: ServiceLocation; label: TKey }[] = [
  { id: 'TRAVELS_TO_CLIENT', label: 'area.travel' },
  { id: 'CLIENT_COMES', label: 'area.clients' },
];

export const AreaScreen: FC = () => {
  const navigation = useAppNavigation();
  const dispatch = useAppDispatch();
  const { t, row } = useLanguage();
  const { form, update } = useSetup();
  const { busy, failure, run } = useStepRunner();
  const travels = form.area === 'TRAVELS_TO_CLIENT';

  // Until a pin is saved, open on the business's city.
  const city = CITIES.find(item => item.name === form.city) ?? CITIES[0];
  const location = {
    latitude: form.latitude ?? city.latitude,
    longitude: form.longitude ?? city.longitude,
  };

  const onContinue = () =>
    run(
      () =>
        dispatch(
          saveServiceArea({
            serviceLocation: form.area,
            ...location,
            ...(travels ? { radiusKm: form.radius } : {}),
          }),
        ).unwrap(),
      () => navigation.navigate('SetupServices'),
    );

  return (
    <SetupScaffold
      step={4}
      error={failure}
      header={t('area.header')}
      title={t('area.title')}
      footer={<PrimaryButton label={t('common.continue')} onPress={onContinue} loading={busy} />}
    >
      {AREA_OPTIONS.map(option => {
        const selected = form.area === option.id;
        return (
          <TouchableOpacity
            key={option.id}
            activeOpacity={0.85}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => update({ area: option.id })}
            style={[styles.option, selected && styles.optionSelected, { flexDirection: row }]}
          >
            <Radio selected={selected} />
            <T weight="medium" style={styles.optionLabel}>
              {t(option.label)}
            </T>
          </TouchableOpacity>
        );
      })}

      <FieldLabel style={styles.label}>{t(travels ? 'area.base' : 'area.location')}</FieldLabel>
      <LocationPicker
        value={location}
        radiusKm={travels ? form.radius : null}
        onChange={({ latitude, longitude }) => update({ latitude, longitude })}
      />

      {travels ? (
        <>
          <FieldLabel style={styles.label}>{t('area.radius')}</FieldLabel>
          <View style={[styles.radii, { flexDirection: row }]}>
            {RADII.map(radius => (
              <Chip
                key={radius}
                label={t('area.km', { n: radius })}
                selected={form.radius === radius}
                onPress={() => update({ radius })}
                style={styles.radiusChip}
              />
            ))}
          </View>
        </>
      ) : null}
    </SetupScaffold>
  );
};

const styles = StyleSheet.create({
  option: {
    alignItems: 'center',
    gap: 12,
    height: 54,
    paddingHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    backgroundColor: COLORS.white,
  },
  optionSelected: { backgroundColor: COLORS.roseSoft, borderColor: COLORS.rose },
  optionLabel: { fontSize: 15, flex: 1 },
  label: { marginTop: 22 },
  radii: { gap: 8 },
  radiusChip: { flex: 1 },
});
