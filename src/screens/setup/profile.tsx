import React, { FC } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { CameraIcon, CheckIcon, PlusIcon, ShieldIcon } from '../../components/icons';
import { SetupScaffold } from '../../components/setup-scaffold';
import {
  Chip,
  FieldLabel,
  LabeledInput,
  PhoneInput,
  PrimaryButton,
  SelectField,
  T,
} from '../../components/ui';
import { ADDRESSES, CITIES, SERVICE_CATEGORIES, TEAM_SIZES } from '../../data/setup';
import { useLanguage } from '../../i18n';
import { useAppNavigation } from '../../navigation/types';
import { toggleItem, useSetup } from '../../state/setup';
import { COLORS } from '../../theme';

export const ProfileScreen: FC = () => {
  const navigation = useAppNavigation();
  const { t, row } = useLanguage();
  const { form, update } = useSetup();

  return (
    <SetupScaffold
      step={2}
      header={t('profile.header')}
      title={t('profile.title')}
      footer={
        <PrimaryButton
          label={t('common.continue')}
          onPress={() => navigation.navigate('SetupSchedule')}
        />
      }
    >
      <View style={styles.center}>
        <TouchableOpacity
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={t('profile.addPhoto')}
          onPress={() => update({ photoAdded: !form.photoAdded })}
          style={[styles.photo, form.photoAdded && styles.addedFill]}
        >
          {form.photoAdded ? <CheckIcon size={30} color={COLORS.white} /> : <CameraIcon size={30} />}
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
        onPress={() => update({ coverAdded: !form.coverAdded })}
        style={[styles.coverRow, { flexDirection: row }]}
      >
        <View style={[styles.coverCircle, form.coverAdded && styles.addedFill]}>
          {form.coverAdded ? <CheckIcon color={COLORS.white} /> : <CameraIcon />}
        </View>
        <View style={styles.flex}>
          <T weight="medium" style={styles.coverTitle}>
            {t(form.coverAdded ? 'profile.coverAdded' : 'profile.coverTitle')}
          </T>
          <T style={styles.coverHint}>{t('profile.coverHint')}</T>
        </View>
      </TouchableOpacity>

      <LabeledInput
        label={t('profile.owner')}
        placeholder={t('profile.ownerPlaceholder')}
        value={form.ownerName}
        onChangeText={ownerName => update({ ownerName })}
      />
      <LabeledInput
        label={t('profile.business')}
        placeholder={t('profile.businessPlaceholder')}
        value={form.businessName}
        onChangeText={businessName => update({ businessName })}
      />
      <LabeledInput
        label={t('profile.description')}
        placeholder={t('profile.descriptionPlaceholder')}
        value={form.description}
        onChangeText={description => update({ description })}
        multiline
        textAlignVertical="top"
        style={styles.description}
      />

      <View style={styles.section}>
        <FieldLabel>{t('profile.phone')}</FieldLabel>
        <PhoneInput value={form.phone} onChangeText={phone => update({ phone })} />
      </View>

      <View style={styles.section}>
        <FieldLabel>{t('profile.services')}</FieldLabel>
        <View style={[styles.grid, { flexDirection: row }]}>
          {SERVICE_CATEGORIES.map((category, index) => (
            <Chip
              key={category.id}
              label={t(category.label)}
              selected={form.services.includes(category.id)}
              onPress={() => update({ services: toggleItem(form.services, category.id) })}
              style={index === SERVICE_CATEGORIES.length - 1 ? styles.fullChip : styles.halfChip}
            />
          ))}
        </View>
      </View>

      <SelectField
        label={t('profile.city')}
        placeholder={t('profile.cityPlaceholder')}
        value={form.city}
        options={CITIES.map(city => ({ id: city.id, label: t(city.label) }))}
        onChange={city => update({ city })}
      />
      <SelectField
        label={t('profile.address')}
        placeholder={t('profile.addressPlaceholder')}
        value={form.address}
        options={ADDRESSES.map(address => ({ id: address.id, label: t(address.label) }))}
        onChange={address => update({ address })}
      />

      <View style={styles.section}>
        <FieldLabel>{t('profile.team')}</FieldLabel>
        <View style={[styles.teamRow, { flexDirection: row }]}>
          {TEAM_SIZES.map(size => (
            <Chip
              key={size}
              label={size}
              selected={form.team === size}
              onPress={() => update({ team: size })}
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
  addedFill: { backgroundColor: COLORS.rose, borderStyle: 'solid' },
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
  fullChip: { width: '100%' },
  teamRow: { gap: 10 },
  privacyRow: { alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20 },
  privacy: { fontSize: 11, color: COLORS.muted, flexShrink: 1 },
});
