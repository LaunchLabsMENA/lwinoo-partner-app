import React, { FC } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ArrowRightIcon } from '../../components/icons';
import { SetupScaffold } from '../../components/setup-scaffold';
import { PrimaryButton, Radio, T } from '../../components/ui';
import { PARTNER_TYPES } from '../../data/setup';
import { useLanguage } from '../../i18n';
import { useAppNavigation } from '../../navigation/types';
import { useSetup } from '../../state/setup';
import { useDraftSync } from '../../state/use-draft';
import { COLORS } from '../../theme';

export const PartnerScreen: FC = () => {
  const navigation = useAppNavigation();
  const saveDraft = useDraftSync();
  const { t, row, isRTL } = useLanguage();
  const { form, update } = useSetup();

  return (
    <SetupScaffold
      step={1}
      header={t('partner.header')}
      title={t('partner.title')}
      titleAlign="left"
      footer={
        <PrimaryButton
          label={t('common.continue')}
          onPress={() => {
            saveDraft();
            navigation.navigate('SetupProfile');
          }}
          icon={
            <View style={isRTL ? styles.flipped : undefined}>
              <ArrowRightIcon size={20} color={COLORS.white} />
            </View>
          }
        />
      }
    >
      {PARTNER_TYPES.map(type => {
        const selected = form.partner === type.id;
        return (
          <TouchableOpacity
            key={type.id}
            activeOpacity={0.85}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => update({ partner: type.id })}
            style={[styles.card, selected && styles.cardSelected, { flexDirection: row }]}
          >
            <Image source={type.image} style={styles.image} />
            <View style={styles.cardText}>
              <T weight="medium" style={styles.cardTitle}>
                {t(type.title)}
              </T>
              <T style={styles.cardSubtitle}>{t(type.subtitle)}</T>
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
