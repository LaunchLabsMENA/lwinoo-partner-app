import React, { FC, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import type { BusinessDocument, DocumentType } from '../../api/types';
import { useLoadCatalog } from '../../components/catalog';
import { CheckIcon, UploadIcon } from '../../components/icons';
import { PickedImage, usePhotoPicker } from '../../components/photo-picker';
import { SetupScaffold } from '../../components/setup-scaffold';
import { FieldLabel, PrimaryButton, T } from '../../components/ui';
import { documentLabel, MAX_MULTI_DOCUMENTS, MULTI_DOCUMENTS } from '../../data/setup';
import { useLanguage } from '../../i18n';
import { useAppNavigation } from '../../navigation/types';
import { useBusinessSetup, usePartnerType } from '../../state/setup';
import { useStepRunner } from '../../state/use-step';
import { useAppDispatch } from '../../store/hooks';
import { attachDocument, loadBusiness, removeDocuments } from '../../store/thunks';
import { COLORS } from '../../theme';

export const DocumentsScreen: FC = () => {
  const navigation = useAppNavigation();
  const dispatch = useAppDispatch();
  const { t, row } = useLanguage();
  const pickPhoto = usePhotoPicker();
  const partnerType = usePartnerType();
  const documents = useBusinessSetup()?.documents ?? [];
  const { failure, setFailure, run } = useStepRunner();
  const [busyType, setBusyType] = useState<DocumentType | null>(null);
  useLoadCatalog();

  useEffect(() => {
    run(() => dispatch(loadBusiness()).unwrap());
    // Load once when the step opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const required = partnerType?.requiredDocuments ?? [];
  const ofType = (type: DocumentType) => documents.filter(item => item.type === type);

  const work = async (type: DocumentType, task: () => Promise<unknown>) => {
    setBusyType(type);
    await run(task);
    setBusyType(null);
  };

  const add = (type: DocumentType) =>
    pickPhoto((file: PickedImage) =>
      work(type, () => dispatch(attachDocument({ type, file })).unwrap()),
    );

  const remove = (type: DocumentType, items: BusinessDocument[]) =>
    work(type, () => dispatch(removeDocuments(items.map(item => item.id))).unwrap());

  const onRow = (type: DocumentType) => {
    if (busyType) {
      return;
    }
    setFailure('');
    const uploaded = ofType(type);
    if (!uploaded.length) {
      add(type);
      return;
    }
    const multi = MULTI_DOCUMENTS.includes(type);
    Alert.alert(t(documentLabel(type)), undefined, [
      ...(multi && uploaded.length < MAX_MULTI_DOCUMENTS
        ? [{ text: t('documents.addAnother'), onPress: () => add(type) }]
        : []),
      ...(!multi ? [{ text: t('documents.replace'), onPress: () => add(type) }] : []),
      {
        text: t(multi ? 'documents.removeAll' : 'documents.remove'),
        style: 'destructive' as const,
        onPress: () => remove(type, uploaded),
      },
      { text: t('photo.cancel'), style: 'cancel' as const },
    ]);
  };

  const onReset = () => {
    if (!documents.length || busyType) {
      return;
    }
    Alert.alert(t('documents.resetTitle'), undefined, [
      { text: t('photo.cancel'), style: 'cancel' },
      {
        text: t('documents.reset'),
        style: 'destructive',
        onPress: () => run(() => dispatch(removeDocuments(documents.map(item => item.id))).unwrap()),
      },
    ]);
  };

  const done = required.filter(type => ofType(type).some(item => item.status !== 'REJECTED'));

  // Documents are optional: the owner can continue and add them later.
  const onContinue = () => navigation.navigate('SetupPayout');

  return (
    <SetupScaffold
      step={6}
      error={failure}
      header={t('documents.header')}
      title={t('documents.title')}
      footerTop={
        <View style={[styles.summary, { flexDirection: row }]}>
          <View style={[styles.summaryLeft, { flexDirection: row }]}>
            <View style={styles.summaryDot} />
            <T weight="medium" style={styles.summaryText}>
              {t('documents.progress', { n: done.length, total: required.length })}
            </T>
          </View>
          <TouchableOpacity accessibilityRole="button" hitSlop={10} onPress={onReset}>
            <T style={styles.reset}>{t('documents.reset')}</T>
          </TouchableOpacity>
        </View>
      }
      footer={<PrimaryButton label={t('common.continue')} onPress={onContinue} />}
    >
      {required.map(type => {
        const uploaded = ofType(type);
        const latest = uploaded[uploaded.length - 1];
        const rejected = latest?.status === 'REJECTED';
        const approved = latest?.status === 'APPROVED';
        const has = uploaded.length > 0 && !rejected;
        const label = !latest
          ? t('documents.tap')
          : rejected
          ? t('documents.rejected')
          : approved
          ? t('documents.approved')
          : MULTI_DOCUMENTS.includes(type) && uploaded.length > 1
          ? t('documents.uploadedCount', { n: uploaded.length })
          : t('documents.uploaded');
        return (
          <View key={type} style={styles.row}>
            <FieldLabel>{`${t(documentLabel(type))} ${t('profile.optional')}`}</FieldLabel>
            <TouchableOpacity
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: has, busy: busyType === type }}
              onPress={() => onRow(type)}
              style={[
                styles.upload,
                has && styles.uploaded,
                rejected && styles.rejected,
                { flexDirection: row },
              ]}
            >
              <View
                style={[
                  styles.uploadIcon,
                  has && styles.uploadedIcon,
                  rejected && styles.rejectedIcon,
                ]}
              >
                {busyType === type ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : has ? (
                  <CheckIcon size={13} color={COLORS.white} />
                ) : (
                  <UploadIcon size={13} color={COLORS.white} />
                )}
              </View>
              <T
                weight="medium"
                style={
                  rejected ? styles.rejectedLabel : has ? styles.uploadedLabel : styles.uploadLabel
                }
              >
                {label}
              </T>
            </TouchableOpacity>
            {rejected && latest.rejectionReason ? (
              <T style={styles.reason}>{latest.rejectionReason}</T>
            ) : null}
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
  rejected: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.danger },
  uploadIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadedIcon: { backgroundColor: COLORS.activeBorder },
  rejectedIcon: { backgroundColor: COLORS.danger },
  uploadLabel: { fontSize: 13 },
  uploadedLabel: { fontSize: 13, color: COLORS.activeBorder },
  rejectedLabel: { fontSize: 13, color: COLORS.danger },
  reason: { fontSize: 12, color: COLORS.danger, marginTop: 6 },
  summary: { alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  summaryLeft: { alignItems: 'center', gap: 6 },
  summaryDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.rose },
  summaryText: { fontSize: 12 },
  reset: { fontSize: 12, color: COLORS.rose },
});
