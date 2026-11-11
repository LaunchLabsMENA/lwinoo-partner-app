import React, { FC, ReactNode } from 'react';
import { Image, ScrollView, StyleSheet, TextInputProps, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PARTNER_AVATAR } from '../data/portal';
import { useLanguage } from '../i18n';
import { COLORS } from '../theme';
import { ChevronDownIcon, PinIcon, SearchIcon, SparkleIcon } from './icons';
import { Input, T, useComingSoon } from './ui';

export const PortalScreen: FC<{ title?: string; children: ReactNode }> = ({ title, children }) => {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {title ? (
        <T weight="semibold" style={styles.title}>
          {title}
        </T>
      ) : null}
      {children}
    </ScrollView>
  );
};

export const SectionTitle: FC<{ children: string }> = ({ children }) => (
  <T weight="medium" style={styles.section}>
    {children}
  </T>
);

export const SearchField: FC<TextInputProps> = props => {
  const { row } = useLanguage();
  return (
    <View style={[styles.search, { flexDirection: row }]}>
      <SearchIcon size={20} color={COLORS.muted} />
      <Input {...props} returnKeyType="search" style={styles.searchInput} />
    </View>
  );
};

export const SmallButton: FC<{ label: string; onPress: () => void }> = ({ label, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    accessibilityRole="button"
    onPress={onPress}
    style={styles.small}
  >
    <T weight="medium" style={styles.smallLabel}>
      {label}
    </T>
  </TouchableOpacity>
);

export const PartnerIdentity: FC<{ inverted?: boolean }> = ({ inverted }) => {
  const { t, row } = useLanguage();
  const comingSoon = useComingSoon();
  const nameColor = inverted ? COLORS.white : COLORS.espresso;
  const metaColor = inverted ? COLORS.roseSoft : COLORS.muted;

  return (
    <View style={[styles.identity, { flexDirection: row }]}>
      <Image source={PARTNER_AVATAR} style={styles.avatar} />
      <View style={styles.flex}>
        <View style={[styles.line, { flexDirection: row }]}>
          <T weight="semibold" style={[styles.name, { color: nameColor }]}>
            {t('portal.partnerName')}
          </T>
          <SparkleIcon />
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={comingSoon}
          style={[styles.line, styles.location, { flexDirection: row }]}
        >
          <PinIcon size={13} color={inverted ? COLORS.roseSoft : COLORS.rose} />
          <T style={[styles.locationText, { color: metaColor }]}>{t('portal.partnerLocation')}</T>
          <ChevronDownIcon size={12} color={metaColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 24 },
  title: { fontSize: 21, marginBottom: 14 },
  section: { fontSize: 14, marginTop: 20 },
  search: {
    height: 52,
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.roseSoft,
    backgroundColor: COLORS.white,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    borderWidth: 0,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    fontSize: 14,
  },
  small: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 9,
    backgroundColor: COLORS.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallLabel: { fontSize: 12, color: COLORS.white },
  identity: { flex: 1, alignItems: 'center', gap: 12 },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    borderColor: COLORS.rose,
  },
  line: { alignItems: 'center', gap: 5 },
  name: { fontSize: 16 },
  location: { marginTop: 5 },
  locationText: { fontSize: 12 },
});
