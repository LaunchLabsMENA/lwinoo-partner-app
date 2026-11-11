import React, { FC, useState } from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { errorMessage } from '../api/errors';
import type { Service } from '../api/types';
import { fileUrl } from '../config';
import { useLanguage } from '../i18n';
import type { AppNavigation } from '../navigation/types';
import { useCategories } from '../state/setup';
import { useAppDispatch } from '../store/hooks';
import { saveService } from '../store/thunks';
import { COLORS } from '../theme';
import { useLocalName } from './catalog';
import { CameraIcon } from './icons';
import { OutlineButton, T } from './ui';

export const ServiceCard: FC<{ service: Service }> = ({ service }) => {
  const { t, row } = useLanguage();
  const navigation = useNavigation<AppNavigation>();
  const dispatch = useAppDispatch();
  const categories = useCategories();
  const localName = useLocalName();
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    if (busy) {
      return;
    }
    setBusy(true);
    try {
      await dispatch(
        saveService({ id: service.id, input: { isActive: !service.isActive } }),
      ).unwrap();
    } catch (problem) {
      Alert.alert(errorMessage(problem, t));
    } finally {
      setBusy(false);
    }
  };

  const image = fileUrl(service.imageUrl);
  const category = categories.find(item => item.id === service.categoryId);
  const details = [
    service.price !== null && service.price !== undefined
      ? t('bookings.price', { n: service.price })
      : null,
    service.durationMinutes ? t('services.minutes', { n: service.durationMinutes }) : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const [firstTag, ...moreTags] = service.tags ?? [];

  return (
    <View style={styles.card}>
      <View style={[styles.cardTop, { flexDirection: row }]}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <CameraIcon />
          </View>
        )}
        <View style={styles.flex}>
          <T weight="medium" style={styles.title} numberOfLines={1}>
            {service.name}
          </T>
          <T style={styles.subtitle} numberOfLines={2}>
            {service.description || (category ? localName(category) : details)}
          </T>
          {details && service.description ? <T style={styles.subtitle}>{details}</T> : null}
          {firstTag ? (
            <View style={[styles.tags, { flexDirection: row }]}>
              <View style={styles.tag}>
                <T style={styles.tagLabel}>{firstTag}</T>
              </View>
              {moreTags.length ? (
                <View style={styles.tag}>
                  <T style={styles.tagLabel}>+{moreTags.length}</T>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
      <View style={[styles.actions, { flexDirection: row }]}>
        <OutlineButton
          label={t('services.edit')}
          onPress={() => navigation.navigate('ServiceForm', { serviceId: service.id })}
          color={COLORS.muted}
          backgroundColor={COLORS.background}
          style={styles.flex}
        />
        <OutlineButton
          label={t(service.isActive ? 'services.active' : 'services.inactive')}
          onPress={toggle}
          color={service.isActive ? COLORS.activeBorder : COLORS.muted}
          borderColor={service.isActive ? COLORS.activeBorder : COLORS.hairline}
          backgroundColor={service.isActive ? COLORS.activeFill : COLORS.white}
          weight="bold"
          style={[styles.flex, busy && styles.busy]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  busy: { opacity: 0.5 },
  card: {
    padding: 12,
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    backgroundColor: COLORS.white,
  },
  cardTop: { gap: 12 },
  image: { width: 86, height: 86, borderRadius: 10 },
  placeholder: { backgroundColor: COLORS.chip, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17 },
  subtitle: { fontSize: 12, color: COLORS.muted, marginTop: 4 },
  tags: { gap: 6, marginTop: 10, flexWrap: 'wrap' },
  tag: {
    backgroundColor: COLORS.chip,
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  tagLabel: { fontSize: 10.5 },
  actions: { gap: 8, marginTop: 12 },
});
