import React, { FC, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { errorMessage } from '../../api/errors';
import { useLoadCatalog, useLocalName } from '../../components/catalog';
import { CountryPhoneInput } from '../../components/country-phone-input';
import { CameraIcon, PlusIcon, ShieldIcon } from '../../components/icons';
import { PickedImage, usePhotoPicker } from '../../components/photo-picker';
import { SetupScaffold } from '../../components/setup-scaffold';
import {
  Chip,
  FieldLabel,
  LabeledInput,
  PrimaryButton,
  SelectField,
  T,
} from '../../components/ui';
import { fileSource, UPLOAD_BASE_URL } from '../../config';
import { COUNTRIES, DEFAULT_COUNTRY } from '../../data/countries';
import { CITIES, TEAM_SIZES } from '../../data/setup';
import { useLanguage } from '../../i18n';
import { TKey } from '../../i18n/translations';
import { useAppNavigation } from '../../navigation/types';
import { toggleItem, useCategories, usePartnerType, useSetup } from '../../state/setup';
import { useStepRunner } from '../../state/use-step';
import { useAppDispatch } from '../../store/hooks';
import { saveProfile, uploadFile } from '../../store/thunks';
import { COLORS } from '../../theme';
import { toE164 } from '../../utils/phone';

export const ProfileScreen: FC = () => {
  const navigation = useAppNavigation();
  const { t, row } = useLanguage();
  const { form, update } = useSetup();
  const pickPhoto = usePhotoPicker();
  const dispatch = useAppDispatch();
  const categories = useCategories();
  const localName = useLocalName();
  const partnerType = usePartnerType();
  const { busy, failure, setFailure, run } = useStepRunner();
  const [uploading, setUploading] = useState<'logo' | 'cover' | null>(null);
  useLoadCatalog();

  const phoneCountry =
    COUNTRIES.find(item => item.iso === form.phoneCountry) ?? DEFAULT_COUNTRY;
  const needsCr = !!partnerType?.requiredDocuments.includes('COMMERCIAL_REGISTRATION');
  const needsCategories = partnerType?.requiresCategories ?? true;

  const upload = async (slot: 'logo' | 'cover', picked: PickedImage) => {
    setUploading(slot);
    try {
      const file = await dispatch(
        uploadFile({ file: picked, purpose: 'photo', baseUrl: UPLOAD_BASE_URL }),
      ).unwrap();
      update(
        slot === 'logo'
          ? { logoFileId: file.fileId, logoUrl: file.url }
          : { coverFileId: file.fileId, coverUrl: file.url },
      );
    } catch (problem) {
      setFailure(errorMessage(problem, t));
    } finally {
      setUploading(null);
    }
  };

  const choose = (slot: 'logo' | 'cover') => {
    if (uploading) {
      return;
    }
    setFailure('');
    pickPhoto(picked => upload(slot, picked));
  };

  const missing = (): TKey | null => {
    if (form.ownerName.trim().length < 2) return 'profile.owner';
    if (form.businessName.trim().length < 2) return 'profile.business';
    if (!toE164(form.phone, phoneCountry)) return 'profile.phone';
    if (needsCategories && !form.categoryIds.length) return 'profile.services';
    if (!form.city) return 'profile.city';
    if (!form.street.trim()) return 'profile.street';
    if (needsCr && !/^\d{10}$/.test(form.crNumber.trim())) return 'profile.cr';
    return null;
  };

  const onContinue = () => {
    const field = missing();
    if (field) {
      setFailure(t('setup.error.required', { field: t(field) }));
      return;
    }
    run(
      () => dispatch(saveProfile()).unwrap(),
      () => navigation.navigate('SetupSchedule'),
    );
  };

  const logo = fileSource(form.logoUrl);
  const cover = fileSource(form.coverUrl);

  return (
    <SetupScaffold
      step={2}
      error={failure}
      header={t('profile.header')}
      title={t('profile.title')}
      footer={<PrimaryButton label={t('common.continue')} onPress={onContinue} loading={busy} />}
    >
      <View style={styles.center}>
        <TouchableOpacity
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={t('profile.addPhoto')}
          onPress={() => choose('logo')}
          style={[styles.photo, logo && styles.pictureAdded]}
        >
          {uploading === 'logo' ? (
            <ActivityIndicator color={COLORS.rose} />
          ) : logo ? (
            <Image source={logo} style={styles.photoImage} />
          ) : (
            <CameraIcon size={30} />
          )}
          <View style={styles.plus}>
            <PlusIcon size={14} color={COLORS.white} />
          </View>
        </TouchableOpacity>
        <T style={styles.photoHint}>
          {t('profile.addPhoto')} <T style={styles.optional}>{t('profile.optional')}</T>
        </T>
      </View>

      <FieldLabel>{t('profile.coverLabel')}</FieldLabel>
      <TouchableOpacity
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={t('profile.coverLabel')}
        onPress={() => choose('cover')}
        style={[styles.coverRow, { flexDirection: row }]}
      >
        <View style={[styles.coverCircle, cover && styles.pictureAdded]}>
          {uploading === 'cover' ? (
            <ActivityIndicator color={COLORS.rose} />
          ) : cover ? (
            <Image source={cover} style={styles.coverImage} />
          ) : (
            <CameraIcon />
          )}
        </View>
        <View style={styles.flex}>
          <T weight="medium" style={styles.coverTitle}>
            {t(cover ? 'profile.coverAdded' : 'profile.coverTitle')}
          </T>
          <T style={styles.coverHint}>{t('profile.coverHint')}</T>
        </View>
      </TouchableOpacity>

      <LabeledInput
        label={t('profile.owner')}
        placeholder={t('profile.ownerPlaceholder')}
        value={form.ownerName}
        onChangeText={ownerName => update({ ownerName })}
        maxLength={80}
      />
      <LabeledInput
        label={t('profile.business')}
        placeholder={t('profile.businessPlaceholder')}
        value={form.businessName}
        onChangeText={businessName => update({ businessName })}
        maxLength={120}
      />
      <LabeledInput
        label={t('profile.description')}
        placeholder={t('profile.descriptionPlaceholder')}
        value={form.description}
        onChangeText={description => update({ description })}
        maxLength={500}
        multiline
        textAlignVertical="top"
        style={styles.description}
      />

      <View style={styles.section}>
        <FieldLabel>{t('profile.phone')}</FieldLabel>
        <CountryPhoneInput
          country={phoneCountry}
          onCountryChange={next => update({ phoneCountry: next.iso })}
          value={form.phone}
          onChangeText={phone => update({ phone })}
        />
      </View>

      {needsCr ? (
        <LabeledInput
          label={t('profile.cr')}
          placeholder="1010123456"
          value={form.crNumber}
          onChangeText={crNumber => update({ crNumber: crNumber.replace(/\D/g, '') })}
          keyboardType="number-pad"
          maxLength={10}
        />
      ) : null}

      <View style={styles.section}>
        <FieldLabel>
          {needsCategories ? t('profile.services') : `${t('profile.services')} ${t('profile.optional')}`}
        </FieldLabel>
        <View style={[styles.grid, { flexDirection: row }]}>
          {categories.map(category => (
            <Chip
              key={category.id}
              label={localName(category)}
              selected={form.categoryIds.includes(category.id)}
              onPress={() => update({ categoryIds: toggleItem(form.categoryIds, category.id) })}
              style={styles.halfChip}
            />
          ))}
        </View>
      </View>

      <SelectField
        label={t('profile.city')}
        placeholder={t('profile.cityPlaceholder')}
        value={form.city}
        options={CITIES.map(city => ({ id: city.name, label: t(city.label) }))}
        onChange={city => update({ city })}
      />
      <LabeledInput
        label={`${t('profile.district')} ${t('profile.optional')}`}
        placeholder={t('profile.districtPlaceholder')}
        value={form.district}
        onChangeText={district => update({ district })}
        maxLength={120}
      />
      <LabeledInput
        label={t('profile.street')}
        placeholder={t('profile.streetPlaceholder')}
        value={form.street}
        onChangeText={street => update({ street })}
        maxLength={160}
      />

      <View style={styles.section}>
        <FieldLabel>{t('profile.team')}</FieldLabel>
        <View style={[styles.teamRow, { flexDirection: row }]}>
          {TEAM_SIZES.map(size => (
            <Chip
              key={size.value}
              label={size.label}
              selected={form.team === size.value}
              onPress={() => update({ team: size.value })}
              style={styles.flex}
            />
          ))}
        </View>
      </View>

      <View style={[styles.privacyRow, { flexDirection: row }]}>
        <ShieldIcon />
        <T style={styles.privacy}>{t('profile.privacy')}</T>
      </View>
    </SetupScaffold>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: 'center', marginTop: 8, marginBottom: 24 },
  photo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.rose,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pictureAdded: { borderStyle: 'solid' },
  photoImage: { width: 93, height: 93, borderRadius: 46.5 },
  coverImage: { width: 69, height: 69, borderRadius: 34.5 },
  plus: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.espresso,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoHint: { fontSize: 12, color: COLORS.muted, marginTop: 12, textAlign: 'center' },
  optional: { fontSize: 12, color: COLORS.placeholder },
  coverRow: { alignItems: 'center', gap: 14 },
  coverCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverTitle: { fontSize: 14 },
  coverHint: { fontSize: 11, color: COLORS.muted, marginTop: 4 },
  description: { height: 96, paddingTop: 14 },
  section: { marginTop: 14 },
  grid: { flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  halfChip: { width: '48.5%' },
  teamRow: { gap: 10 },
  privacyRow: { alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20 },
  privacy: { fontSize: 11, color: COLORS.muted, flexShrink: 1 },
});
