import React, { FC, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { errorMessage } from '../../api/errors';
import { useLoadCatalog, useLocalName } from '../../components/catalog';
import { CameraIcon } from '../../components/icons';
import { usePhotoPicker } from '../../components/photo-picker';
import { SetupScaffold } from '../../components/setup-scaffold';
import {
  FieldLabel,
  LabeledInput,
  OutlineButton,
  PrimaryButton,
  SelectField,
  T,
} from '../../components/ui';
import { fileUrl } from '../../config';
import { useLanguage } from '../../i18n';
import { RootStackParamList, useAppNavigation } from '../../navigation/types';
import { useBusinessSetup, useCategories } from '../../state/setup';
import { useStepRunner } from '../../state/use-step';
import { useAppDispatch } from '../../store/hooks';
import { removeService, saveService, uploadFile } from '../../store/thunks';
import { COLORS } from '../../theme';

const PRICE = /^\d+(\.\d{1,2})?$/;

/** Add a service, or edit one when opened with a `serviceId`. */
export const ServiceFormScreen: FC = () => {
  const navigation = useAppNavigation();
  const { params } = useRoute<RouteProp<RootStackParamList, 'ServiceForm'>>();
  const dispatch = useAppDispatch();
  const { t, row } = useLanguage();
  const categories = useCategories();
  const localName = useLocalName();
  const pickPhoto = usePhotoPicker();
  const existing = useBusinessSetup()?.services.find(item => item.id === params?.serviceId);
  const { busy, failure, setFailure, run } = useStepRunner();
  useLoadCatalog();

  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [categoryId, setCategoryId] = useState<string | null>(existing?.categoryId ?? null);
  const [tags, setTags] = useState((existing?.tags ?? []).join(', '));
  const [price, setPrice] = useState(existing?.price != null ? String(existing.price) : '');
  const [duration, setDuration] = useState(
    existing?.durationMinutes ? String(existing.durationMinutes) : '',
  );
  const [isActive, setIsActive] = useState(existing?.isActive ?? true);
  const [image, setImage] = useState<{ fileId?: string; url: string | null }>({
    url: existing?.imageUrl ?? null,
  });
  const [uploading, setUploading] = useState(false);

  const choosePhoto = () =>
    pickPhoto(async picked => {
      setUploading(true);
      setFailure('');
      try {
        const file = await dispatch(uploadFile({ file: picked, purpose: 'photo' })).unwrap();
        setImage({ fileId: file.fileId, url: file.url });
      } catch (problem) {
        setFailure(errorMessage(problem, t));
      } finally {
        setUploading(false);
      }
    });

  const onSave = () => {
    const minutes = Number(duration);
    if (!name.trim()) {
      setFailure(t('setup.error.required', { field: t('serviceForm.name') }));
      return;
    }
    if (price && !PRICE.test(price)) {
      setFailure(t('serviceForm.priceInvalid'));
      return;
    }
    if (duration && (!Number.isInteger(minutes) || minutes < 5 || minutes > 720)) {
      setFailure(t('serviceForm.durationInvalid'));
      return;
    }
    const input = {
      name: name.trim(),
      description: description.trim() || null,
      ...(image.fileId ? { imageFileId: image.fileId } : {}),
      tags: tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean),
      categoryId,
      price: price ? Number(price) : null,
      durationMinutes: duration ? minutes : null,
      isActive,
    };
    run(
      () => dispatch(saveService({ id: existing?.id, input })).unwrap(),
      () => navigation.goBack(),
    );
  };

  const onDelete = () => {
    if (!existing) {
      return;
    }
    Alert.alert(t('serviceForm.deleteTitle'), existing.name, [
      { text: t('photo.cancel'), style: 'cancel' },
      {
        text: t('serviceForm.delete'),
        style: 'destructive',
        onPress: () =>
          run(
            () => dispatch(removeService(existing.id)).unwrap(),
            () => navigation.goBack(),
          ),
      },
    ]);
  };

  const preview = fileUrl(image.url);

  return (
    <SetupScaffold
      error={failure}
      header={t(existing ? 'serviceForm.editTitle' : 'serviceForm.addTitle')}
      title={t(existing ? 'serviceForm.editTitle' : 'serviceForm.addTitle')}
      footer={
        <>
          {existing ? (
            <OutlineButton
              label={t('serviceForm.delete')}
              onPress={onDelete}
              color={COLORS.danger}
              borderColor={COLORS.danger}
              style={styles.delete}
            />
          ) : null}
          <PrimaryButton label={t('serviceForm.save')} onPress={onSave} loading={busy} />
        </>
      }
    >
      <TouchableOpacity
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={t('serviceForm.photo')}
        onPress={choosePhoto}
        style={styles.photo}
      >
        {uploading ? (
          <ActivityIndicator color={COLORS.rose} />
        ) : preview ? (
          <Image source={{ uri: preview }} style={styles.photoImage} />
        ) : (
          <>
            <CameraIcon />
            <T style={styles.photoText}>{t('serviceForm.photo')}</T>
          </>
        )}
      </TouchableOpacity>

      <LabeledInput
        label={t('serviceForm.name')}
        placeholder={t('serviceForm.namePlaceholder')}
        value={name}
        onChangeText={setName}
        maxLength={120}
      />
      <LabeledInput
        label={`${t('profile.description')} ${t('profile.optional')}`}
        placeholder={t('serviceForm.descriptionPlaceholder')}
        value={description}
        onChangeText={setDescription}
        maxLength={500}
        multiline
        textAlignVertical="top"
        style={styles.description}
      />
      <SelectField
        label={`${t('serviceForm.category')} ${t('profile.optional')}`}
        placeholder={t('serviceForm.categoryPlaceholder')}
        value={categoryId}
        options={categories.map(category => ({ id: category.id, label: localName(category) }))}
        onChange={setCategoryId}
      />
      <View style={[styles.pair, { flexDirection: row }]}>
        <View style={styles.flex}>
          <LabeledInput
            label={t('serviceForm.price')}
            placeholder="250"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            maxLength={10}
          />
        </View>
        <View style={styles.flex}>
          <LabeledInput
            label={t('serviceForm.duration')}
            placeholder="60"
            value={duration}
            onChangeText={value => setDuration(value.replace(/\D/g, ''))}
            keyboardType="number-pad"
            maxLength={3}
          />
        </View>
      </View>
      <LabeledInput
        label={`${t('serviceForm.tags')} ${t('profile.optional')}`}
        placeholder={t('serviceForm.tagsPlaceholder')}
        value={tags}
        onChangeText={setTags}
      />
      <View style={[styles.activeRow, { flexDirection: row }]}>
        <View style={styles.flex}>
          <FieldLabel>{t('services.active')}</FieldLabel>
          <T style={styles.activeHint}>{t('serviceForm.activeHint')}</T>
        </View>
        <Switch
          value={isActive}
          onValueChange={setIsActive}
          trackColor={{ false: COLORS.roseSoft, true: COLORS.rose }}
          thumbColor={COLORS.white}
          ios_backgroundColor={COLORS.roseSoft}
        />
      </View>
    </SetupScaffold>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  photo: {
    height: 150,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.rose,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  photoImage: { width: '100%', height: '100%' },
  photoText: { fontSize: 13, color: COLORS.muted },
  description: { height: 90, paddingTop: 14 },
  pair: { gap: 12 },
  activeRow: { alignItems: 'center', gap: 12, marginTop: 18 },
  activeHint: { fontSize: 12, color: COLORS.muted },
  delete: { height: 54, borderRadius: 27, marginBottom: 12 },
});
