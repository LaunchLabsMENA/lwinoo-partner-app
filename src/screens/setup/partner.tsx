import React, { FC, useCallback } from 'react';
import { ActivityIndicator, Alert, BackHandler, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useLoadCatalog, useLocalName } from '../../components/catalog';
import { ArrowRightIcon } from '../../components/icons';
import { SetupScaffold } from '../../components/setup-scaffold';
import { OutlineButton, PrimaryButton, Radio, T } from '../../components/ui';
import { DEFAULT_PARTNER_IMAGE, PARTNER_TYPE_IMAGES } from '../../data/setup';
import { fileUrl } from '../../config';
import { useFocusEffect } from '@react-navigation/native';
import { useLanguage } from '../../i18n';
import { useAppNavigation } from '../../navigation/types';
import { usePartnerTypes, useSetup } from '../../state/setup';
import { useStepRunner } from '../../state/use-step';
import { useAppDispatch } from '../../store/hooks';
import { loadCatalog, logout, savePartnerType } from '../../store/thunks';
import { COLORS } from '../../theme';

export const PartnerScreen: FC = () => {
  const navigation = useAppNavigation();
  const dispatch = useAppDispatch();
  const { t, row, isRTL, lang } = useLanguage();
  const { form, update } = useSetup();
  const partnerTypes = usePartnerTypes();
  const localName = useLocalName();
  const { busy, failure, setFailure, run } = useStepRunner();
  useLoadCatalog();

  // This is the first setup step, so leaving it signs the owner out (back to Login).
  const onLeave = useCallback(() => {
    Alert.alert(t('partner.leaveTitle'), t('partner.leaveMessage'), [
      { text: t('photo.cancel'), style: 'cancel' },
      { text: t('review.logout'), style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
  }, [t, dispatch]);

  // Android's hardware back button does the same instead of closing the app.
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        onLeave();
        return true;
      });
      return () => sub.remove();
    }, [onLeave]),
  );

  const onContinue = () => {
    if (!form.partnerTypeId) {
      setFailure(t('partner.pick'));
      return;
    }
    const id = form.partnerTypeId;
    run(
      () => dispatch(savePartnerType(id)).unwrap(),
      () => navigation.navigate('SetupProfile'),
    );
  };

  return (
    <SetupScaffold
      step={1}
      error={failure}
      header={t('partner.header')}
      title={t('partner.title')}
      titleAlign="left"
      onBack={onLeave}
      footer={
        <PrimaryButton
          label={t('common.continue')}
          onPress={onContinue}
          loading={busy}
          icon={
            <View style={isRTL ? styles.flipped : undefined}>
              <ArrowRightIcon size={20} color={COLORS.white} />
            </View>
          }
        />
      }
    >
      {partnerTypes.length === 0 ? (
        <View style={styles.loading}>
          <ActivityIndicator color={COLORS.rose} />
          <OutlineButton
            label={t('common.retry')}
            onPress={() => dispatch(loadCatalog())}
            style={styles.retry}
          />
        </View>
      ) : null}
      {partnerTypes.map(type => {
        const selected = form.partnerTypeId === type.id;
        const image = fileUrl(type.imageUrl);
        const description =
          (lang === 'ar' ? type.descriptionAr : null) ?? type.descriptionEn ?? '';
        return (
          <TouchableOpacity
            key={type.id}
            activeOpacity={0.85}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => update({ partnerTypeId: type.id })}
            style={[styles.card, selected && styles.cardSelected, { flexDirection: row }]}
          >
            <Image
              source={image ? { uri: image } : PARTNER_TYPE_IMAGES[type.slug] ?? DEFAULT_PARTNER_IMAGE}
              style={styles.image}
            />
            <View style={styles.cardText}>
              <T weight="medium" style={styles.cardTitle}>
                {localName(type)}
              </T>
              <T style={styles.cardSubtitle} numberOfLines={2}>
                {description}
              </T>
            </View>
            <Radio selected={selected} />
          </TouchableOpacity>
        );
      })}
    </SetupScaffold>
  );
};

const styles = StyleSheet.create({
  flipped: { transform: [{ scaleX: -1 }] },
  loading: { alignItems: 'center', gap: 16, marginTop: 24 },
  retry: { paddingHorizontal: 24 },
  card: {
    alignItems: 'center',
    gap: 12,
    padding: 12,
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    backgroundColor: COLORS.white,
  },
  cardSelected: { backgroundColor: COLORS.roseSoft, borderColor: COLORS.rose },
  image: { width: 66, height: 66, borderRadius: 14 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 15 },
  cardSubtitle: { fontSize: 12, color: COLORS.muted, marginTop: 5 },
});
