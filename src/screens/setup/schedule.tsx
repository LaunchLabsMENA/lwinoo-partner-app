import React, { FC } from 'react';
import { StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { SetupScaffold } from '../../components/setup-scaffold';
import { FieldLabel, Input, PrimaryButton, T } from '../../components/ui';
import { DAYS } from '../../data/setup';
import { useLanguage } from '../../i18n';
import { useAppNavigation } from '../../navigation/types';
import { toggleItem, useSetup } from '../../state/setup';
import { useStepRunner } from '../../state/use-step';
import { useAppDispatch } from '../../store/hooks';
import { saveSchedule } from '../../store/thunks';
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

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const END_TIME = /^(([01]\d|2[0-3]):[0-5]\d|24:00)$/;
const minutes = (value: string) => Number(value.slice(0, 2)) * 60 + Number(value.slice(3));

export const ScheduleScreen: FC = () => {
  const navigation = useAppNavigation();
  const dispatch = useAppDispatch();
  const { busy, failure, setFailure, run } = useStepRunner();
  const { t, row } = useLanguage();
  const { form, update } = useSetup();

  const problem = () => {
    if (!form.days.length) return t('schedule.error.days');
    if (!TIME.test(form.timeStart) || !END_TIME.test(form.timeEnd)) return t('setup.error.time');
    if (minutes(form.timeEnd) <= minutes(form.timeStart)) return t('schedule.error.order');
    if (form.breakEnabled) {
      if (!TIME.test(form.breakStart) || !TIME.test(form.breakEnd)) return t('setup.error.time');
      const start = minutes(form.breakStart);
      const end = minutes(form.breakEnd);
      if (end <= start || start < minutes(form.timeStart) || end > minutes(form.timeEnd)) {
        return t('schedule.error.break');
      }
    }
    return null;
  };

  const onContinue = () => {
    const issue = problem();
    if (issue) {
      setFailure(issue);
      return;
    }
    run(
      () => dispatch(saveSchedule()).unwrap(),
      () => navigation.navigate('SetupArea'),
    );
  };

  return (
    <SetupScaffold
      step={3}
      error={failure}
      header={t('schedule.header')}
      title={t('schedule.title')}
      footer={
        <PrimaryButton label={t('common.continue')} onPress={onContinue} loading={busy} />
      }
    >
      <View style={[styles.days, { flexDirection: row }]}>
        {DAYS.map((day, dayOfWeek) => {
          const selected = form.days.includes(dayOfWeek);
          return (
            <TouchableOpacity
              key={day.id}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => update({ days: toggleItem(form.days, dayOfWeek) })}
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
