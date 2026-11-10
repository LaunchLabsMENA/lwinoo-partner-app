import React, { FC } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { CheckIcon, UploadIcon } from '../../components/icons';
import { SetupScaffold } from '../../components/setup-scaffold';
import { FieldLabel, PrimaryButton, T } from '../../components/ui';
import { DOCUMENTS } from '../../data/setup';
import { useLanguage } from '../../i18n';
import { useAppNavigation } from '../../navigation/types';
import { toggleItem, useSetup } from '../../state/setup';
import { COLORS } from '../../theme';

export const DocumentsScreen: FC = () => {
  const navigation = useAppNavigation();
  const { t, row } = useLanguage();
  const { form, update } = useSetup();

  return (
    <SetupScaffold
      step={6}
      header={t('documents.header')}
      title={t('documents.title')}
      footerTop={
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
      }
      footer={
        <PrimaryButton
          label={t('documents.submit')}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'UnderReview' }] })}
        />
      }
    >
      {DOCUMENTS.map(document => {
        const uploaded = form.documents.includes(document.id);
        return (
          <View key={document.id} style={styles.row}>
            <FieldLabel>{t(document.label)}</FieldLabel>
            <TouchableOpacity
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: uploaded }}
              onPress={() => update({ documents: toggleItem(form.documents, document.id) })}
              style={[styles.upload, uploaded && styles.uploaded, { flexDirection: row }]}
            >
              <View style={[styles.uploadIcon, uploaded && styles.uploadedIcon]}>
                {uploaded ? (
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
});
