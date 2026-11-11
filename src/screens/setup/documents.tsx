import React, { FC, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { errorMessage } from '../../api/errors';
import type { DocumentType } from '../../api/types';
import { CheckIcon, UploadIcon } from '../../components/icons';
import { PickedImage, usePhotoPicker } from '../../components/photo-picker';
import { SetupScaffold } from '../../components/setup-scaffold';
import { FieldLabel, PrimaryButton, T } from '../../components/ui';
import { DOCUMENTS } from '../../data/setup';
import { useLanguage } from '../../i18n';
import { useAppNavigation } from '../../navigation/types';
import { useSetup } from '../../state/setup';
import { validateSetup } from '../../state/validate';
import { useAppDispatch } from '../../store/hooks';
import { submitApplication, uploadPicture } from '../../store/thunks';
import { COLORS } from '../../theme';

export const DocumentsScreen: FC = () => {
  const navigation = useAppNavigation();
  const { t, row } = useLanguage();
  const { form, update } = useSetup();
  const pickPhoto = usePhotoPicker();
  const dispatch = useAppDispatch();
  const [busy, setBusy] = useState<DocumentType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState('');

  const upload = async (type: DocumentType, picked: PickedImage) => {
    setBusy(type);
    try {
      const url = await dispatch(uploadPicture({ ...picked, purpose: 'document' })).unwrap();
      update({ documents: [...form.documents.filter(item => item.type !== type), { type, url }] });
    } catch (problem) {
      setFailure(errorMessage(problem, t));
    } finally {
      setBusy(null);
    }
  };

  const toggle = (type: DocumentType) => {
    if (busy || submitting) {
      return;
    }
    setFailure('');
    if (form.documents.some(item => item.type === type)) {
      update({ documents: form.documents.filter(item => item.type !== type) });
      return;
    }
    pickPhoto(picked => upload(type, picked));
  };

  const submit = async () => {
    if (busy || submitting) {
      return;
    }
    const issue = validateSetup(form);
    if (issue) {
      setFailure(
        issue.key === 'required'
          ? t('setup.error.required', { field: t(issue.field) })
          : t(issue.key === 'time' ? 'setup.error.time' : 'setup.error.documents'),
      );
      return;
    }
    setSubmitting(true);
    setFailure('');
    try {
      await dispatch(submitApplication()).unwrap();
      navigation.reset({ index: 0, routes: [{ name: 'UnderReview' }] });
    } catch (problem) {
      setFailure(errorMessage(problem, t));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SetupScaffold
      step={6}
      header={t('documents.header')}
      title={t('documents.title')}
      footerTop={
        <View>
          {failure ? <T style={styles.failure}>{failure}</T> : null}
          <View style={[styles.summary, { flexDirection: row }]}>
            <View style={[styles.summaryLeft, { flexDirection: row }]}>
              <View style={styles.summaryDot} />
              <T weight="medium" style={styles.summaryText}>
                {t('documents.count', { n: form.documents.length })}
              </T>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              hitSlop={10}
              onPress={() => update({ documents: [] })}
            >
              <T style={styles.reset}>{t('documents.reset')}</T>
            </TouchableOpacity>
          </View>
        </View>
      }
      footer={
        <PrimaryButton
          label={t('documents.submit')}
          onPress={submit}
          loading={submitting}
        />
      }
    >
      {DOCUMENTS.map(document => {
        const uploaded = form.documents.some(item => item.type === document.id);
        return (
          <View key={document.id} style={styles.row}>
            <FieldLabel>{t(document.label)}</FieldLabel>
            <TouchableOpacity
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: uploaded }}
              onPress={() => toggle(document.id)}
              style={[styles.upload, uploaded && styles.uploaded, { flexDirection: row }]}
            >
              <View style={[styles.uploadIcon, uploaded && styles.uploadedIcon]}>
                {busy === document.id ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : uploaded ? (
                  <CheckIcon size={13} color={COLORS.white} />
                ) : (
                  <UploadIcon size={13} color={COLORS.white} />
                )}
              </View>
              <T weight="medium" style={uploaded ? styles.uploadedLabel : styles.uploadLabel}>
                {t(uploaded ? 'documents.uploaded' : 'documents.tap')}
              </T>
            </TouchableOpacity>
          </View>
        );
      })}
    </SetupScaffold>
  );
};

const styles = StyleSheet.create({
  row: { marginTop: 8, marginBottom: 8 },
  upload: {
    height: 58,
    borderRadius: 12,
    backgroundColor: COLORS.roseSoft,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploaded: {
    backgroundColor: COLORS.activeFill,
    borderWidth: 1,
    borderColor: COLORS.activeBorder,
  },
  uploadIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadedIcon: { backgroundColor: COLORS.activeBorder },
  uploadLabel: { fontSize: 13 },
  uploadedLabel: { fontSize: 13, color: COLORS.activeBorder },
  summary: { alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  summaryLeft: { alignItems: 'center', gap: 6 },
  summaryDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.rose },
  summaryText: { fontSize: 12 },
  reset: { fontSize: 12, color: COLORS.rose },
  failure: { fontSize: 12, color: COLORS.error, marginBottom: 8 },
});
