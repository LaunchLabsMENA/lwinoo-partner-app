import React, { FC } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { toApiError } from '../../api/errors';
import { SetupScaffold } from '../../components/setup-scaffold';
import { LabeledInput, PrimaryButton, Radio, T } from '../../components/ui';
import { useLanguage } from '../../i18n';
import { resetTo, setupRoutes } from '../../navigation/route-for';
import { useAppNavigation } from '../../navigation/types';
import { useBusinessSetup, useSetup } from '../../state/setup';
import { useStepRunner } from '../../state/use-step';
import { useAppDispatch } from '../../store/hooks';
import { loadBusiness, savePayout, submitApplication } from '../../store/thunks';
import { COLORS } from '../../theme';

const IBAN = /^SA\d{22}$/;

export const PayoutScreen: FC = () => {
  const navigation = useAppNavigation();
  const dispatch = useAppDispatch();
  const { t, row } = useLanguage();
  const { form, update } = useSetup();
  const saved = useBusinessSetup()?.business;
  const { busy, failure, setFailure, run } = useStepRunner();

  // The server only ever sends the IBAN masked, so a saved one is kept unless retyped.
  const hasSavedIban = !!saved?.iban;
  const iban = form.iban.replace(/\s/g, '').toUpperCase();

  const onSubmit = () => {
    if (!form.bankName.trim()) {
      setFailure(t('setup.error.required', { field: t('payout.bank') }));
      return;
    }
    if (!(hasSavedIban && !iban) && !IBAN.test(iban)) {
      setFailure(t('payout.ibanInvalid'));
      return;
    }
    if (!form.acceptedTerms) {
      setFailure(t('payout.termsRequired'));
      return;
    }
    run(async () => {
      if (iban || !hasSavedIban || form.bankName.trim() !== saved?.bankName) {
        await dispatch(
          savePayout({ bankName: form.bankName.trim(), iban: iban, acceptedTerms: true }),
        ).unwrap();
      }
      try {
        await dispatch(submitApplication()).unwrap();
      } catch (problem) {
        if (toApiError(problem).code !== 'BUSINESS_INCOMPLETE') {
          throw problem;
        }
        // Send the owner to the first step that still needs work.
        const setup = await dispatch(loadBusiness()).unwrap();
        Alert.alert(t('payout.incomplete'), toApiError(problem).message, [
          {
            text: t('common.ok'),
            onPress: () => navigation.reset(resetTo(setupRoutes(setup.business?.setupStep))),
          },
        ]);
        return;
      }
      navigation.reset(resetTo([{ name: 'UnderReview' }]));
    });
  };

  return (
    <SetupScaffold
      step={7}
      error={failure}
      header={t('payout.header')}
      title={t('payout.title')}
      footer={<PrimaryButton label={t('documents.submit')} onPress={onSubmit} loading={busy} />}
    >
      <T style={styles.intro}>{t('payout.intro')}</T>
      <LabeledInput
        label={t('payout.bank')}
        placeholder={t('payout.bankPlaceholder')}
        value={form.bankName}
        onChangeText={bankName => update({ bankName })}
        maxLength={80}
      />
      <LabeledInput
        label={t('payout.iban')}
        placeholder={hasSavedIban ? saved?.iban ?? '' : 'SA00 0000 0000 0000 0000 0000'}
        value={form.iban}
        onChangeText={value => update({ iban: value.toUpperCase() })}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={34}
      />
      {hasSavedIban ? <T style={styles.hint}>{t('payout.savedIban')}</T> : null}
      <TouchableOpacity
        activeOpacity={0.8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: form.acceptedTerms }}
        onPress={() => update({ acceptedTerms: !form.acceptedTerms })}
        style={[styles.terms, { flexDirection: row }]}
      >
        <Radio selected={form.acceptedTerms} />
        <T style={styles.termsText}>{t('payout.terms')}</T>
      </TouchableOpacity>
      <View style={styles.spacer} />
    </SetupScaffold>
  );
};

const styles = StyleSheet.create({
  intro: { fontSize: 13, color: COLORS.muted, textAlign: 'center', marginBottom: 6 },
  hint: { fontSize: 12, color: COLORS.muted, marginTop: 6 },
  terms: { alignItems: 'center', gap: 12, marginTop: 24 },
  termsText: { flex: 1, fontSize: 13 },
  spacer: { height: 12 },
});
