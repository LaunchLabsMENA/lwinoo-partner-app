import React, { FC } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { SetupScaffold } from '../../components/setup-scaffold';
import { Chip, FieldLabel, PrimaryButton, Radio, T } from '../../components/ui';
import { RADII } from '../../data/setup';
import { useLanguage } from '../../i18n';
import { TKey } from '../../i18n/translations';
import { useAppNavigation } from '../../navigation/types';
import { useSetup } from '../../state/setup';
import { useDraftSync } from '../../state/use-draft';
import { COLORS } from '../../theme';

const AREA_OPTIONS: { id: 'travel' | 'clients'; label: TKey }[] = [
  { id: 'travel', label: 'area.travel' },
  { id: 'clients', label: 'area.clients' },
];

const MAP_WIDTH = 350;
const MAP_HEIGHT = 182;
const CENTER_X = MAP_WIDTH / 2;
const CENTER_Y = MAP_HEIGHT / 2;

const STREETS = [
  'M0 34 H350',
  'M0 92 L120 86 L350 104',
  'M0 150 H350',
  'M42 0 V182',
  'M118 0 L126 182',
  'M214 0 L206 182',
  'M292 0 V182',
  'M0 60 H118',
  'M214 62 H350',
  'M126 128 H292',
];

const PLACES: [number, number, string][] = [
  [84, 58, '#7FA98F'],
  [150, 74, COLORS.espresso],
  [188, 120, COLORS.rose],
  [146, 128, '#D98A6A'],
  [226, 54, '#7FA98F'],
  [262, 132, '#D98A6A'],
  [66, 124, '#8A93C9'],
  [316, 48, COLORS.espresso],
];

const StaticMap: FC<{ radiusKm: number }> = ({ radiusKm }) => (
  <Svg width="100%" height="100%" viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} preserveAspectRatio="xMidYMid slice">
    <Rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="#F0ECEA" />
    {STREETS.map(d => (
      <Path key={d} d={d} stroke={COLORS.white} strokeWidth={4} fill="none" />
    ))}
    {PLACES.map(([cx, cy, fill]) => (
      <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={2.6} fill={fill} />
    ))}
    <Circle
      cx={CENTER_X}
      cy={CENTER_Y}
      r={22 + radiusKm * 3.7}
      fill={COLORS.rose}
      fillOpacity={0.42}
      stroke={COLORS.rose}
      strokeOpacity={0.6}
    />
    <Path
      d={`M${CENTER_X} ${CENTER_Y + 10}c-5-6-8-9-8-13a8 8 0 0116 0c0 4-3 7-8 13z`}
      fill="#6E8F86"
    />
    <Circle cx={CENTER_X} cy={CENTER_Y - 3} r={2.8} fill={COLORS.white} />
  </Svg>
);

export const AreaScreen: FC = () => {
  const navigation = useAppNavigation();
  const saveDraft = useDraftSync();
  const { t, row } = useLanguage();
  const { form, update } = useSetup();

  return (
    <SetupScaffold
      step={4}
      header={t('area.header')}
      title={t('area.title')}
      footer={
        <PrimaryButton
          label={t('common.continue')}
          onPress={() => {
            saveDraft();
            navigation.navigate('SetupServices');
          }}
        />
      }
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

      <FieldLabel style={styles.radiusLabel}>{t('area.radius')}</FieldLabel>
      <View style={styles.map}>
        <StaticMap radiusKm={form.radius} />
      </View>
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
  radiusLabel: { marginTop: 22 },
  map: {
    height: 182,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.hairline,
  },
  radii: { gap: 8, marginTop: 14 },
  radiusChip: { flex: 1 },
});
