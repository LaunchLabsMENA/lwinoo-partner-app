import React, { FC } from 'react';
import { StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { SetupScaffold } from '../../components/setup-scaffold';
import { FieldLabel, Input, PrimaryButton, T } from '../../components/ui';
import { DAYS } from '../../data/setup';
import { useLanguage } from '../../i18n';
import { useAppNavigation } from '../../navigation/types';
import { toggleItem, useSetup } from '../../state/setup';
import { COLORS } from '../../theme';

const TimeField: FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => (
  <View style={styles.timeField}>
    <FieldLabel>{label}</FieldLabel>
    <Input
      value={value}
      onChangeText={onChange}
      placeholder="00:00"
      keyboardType="numbers-and-punctuation"
      maxLength={5}
    />
  </View>
);

export const ScheduleScreen: FC = () => {
  const navigation = useAppNavigation();
  const { t, row } = useLanguage();
  const { form, update } = useSetup();

  return (
    <SetupScaffold
      step={3}
      header={t('schedule.header')}
      title={t('schedule.title')}
      footer={
        <PrimaryButton
          label={t('common.continue')}
          onPress={() => navigation.navigate('SetupArea')}
        />
      }
    >
      <View style={[styles.days, { flexDirection: row }]}>
        {DAYS.map(day => {
          const selected = form.days.includes(day.id);
          return (
            <TouchableOpacity
              key={day.id}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => update({ days: toggleItem(form.days, day.id) })}
              style={[styles.day, selected && styles.daySelected]}
            >
              <T weight="medium" style={[styles.dayLabel, selected && styles.dayLabelSelected]}>
                {t(day.label)}
              </T>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={[styles.timeRow, { flexDirection: row }]}>
        <TimeField
          label={t('schedule.start')}
          value={form.timeStart}
          onChange={timeStart => update({ timeStart })}
        />
        <TimeField
          label={t('schedule.end')}
          value={form.timeEnd}
          onChange={timeEnd => update({ timeEnd })}
        />
      </View>

      <View style={[styles.breakCard, { flexDirection: row }]}>
        <View style={styles.flex}>
          <T weight="medium" style={styles.breakTitle}>
            {t('schedule.break')}
          </T>
          <T style={styles.breakHint}>{t('schedule.breakHint')}</T>
        </View>
        <Switch
          value={form.breakEnabled}
          onValueChange={breakEnabled => update({ breakEnabled })}
          trackColor={{ false: COLORS.roseSoft, true: COLORS.rose }}
          thumbColor={COLORS.white}
          ios_backgroundColor={COLORS.roseSoft}
        />
      </View>

      {form.breakEnabled ? (
        <View style={[styles.timeRow, { flexDirection: row }]}>
          <TimeField
            label={t('schedule.breakStart')}
            value={form.breakStart}
            onChange={breakStart => update({ breakStart })}
          />
          <TimeField
            label={t('schedule.breakEnd')}
            value={form.breakEnd}
            onChange={breakEnd => update({ breakEnd })}
          />
        </View>
      ) : null}
    </SetupScaffold>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  days: { justifyContent: 'space-between', marginTop: 4 },
  day: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: COLORS.rose,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySelected: { backgroundColor: COLORS.rose },
  dayLabel: { fontSize: 11, textAlign: 'center' },
  dayLabelSelected: { color: COLORS.white },
  timeRow: { gap: 12, marginTop: 20 },
  timeField: { flex: 1 },
  breakCard: {
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    backgroundColor: COLORS.white,
  },
  breakTitle: { fontSize: 15 },
  breakHint: { fontSize: 12, color: COLORS.muted, marginTop: 4 },
});
