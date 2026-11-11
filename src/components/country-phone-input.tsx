import React, { FC, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COUNTRIES, Country, flagOf } from '../data/countries';
import { useLanguage } from '../i18n';
import { COLORS } from '../theme';
import { ChevronDownIcon, SearchIcon } from './icons';
import { Input, T } from './ui';

const normalize = (text: string) => text.toLowerCase().replace(/[\s+()-]/g, '');

/** Phone number field with a country picker; numbers always read left to right. */
export const CountryPhoneInput: FC<
  Omit<TextInputProps, 'value' | 'onChangeText'> & {
    country: Country;
    onCountryChange: (country: Country) => void;
    value: string;
    onChangeText: (value: string) => void;
  }
> = ({ country, onCountryChange, value, onChangeText, style, ...rest }) => {
  const insets = useSafeAreaInsets();
  const { t, lang, fontFor } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const nameOf = (item: Country) => (lang === 'ar' ? item.ar : item.en);

  const list = useMemo(() => {
    const needle = normalize(query);
    const sorted = [...COUNTRIES].sort((a, b) =>
      a.iso === 'SA' ? -1 : b.iso === 'SA' ? 1 : nameOf(a).localeCompare(nameOf(b), lang),
    );
    return needle
      ? sorted.filter(item =>
          [item.en, item.ar, item.iso, item.dial, `+${item.dial}`].some(text =>
            normalize(text).includes(needle),
          ),
        )
      : sorted;
    // nameOf only depends on lang.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, lang]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <>
      <View style={[styles.field, style]}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t('login.country', { name: nameOf(country) })}
          activeOpacity={0.7}
          hitSlop={6}
          onPress={() => setOpen(true)}
          style={styles.country}
        >
          <Text style={styles.flag}>{flagOf(country.iso)}</Text>
          <ChevronDownIcon size={16} />
        </TouchableOpacity>
        <Text style={[styles.dial, { fontFamily: fontFor('regular') }]}>{`+${country.dial}`}</Text>
        <TextInput
          placeholder={country.example || '000 000 0000'}
          placeholderTextColor={COLORS.placeholder}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
          maxLength={18}
          value={value}
          onChangeText={onChangeText}
          {...rest}
          style={[styles.number, { fontFamily: fontFor('regular') }]}
        />
      </View>

      <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
        <Pressable style={styles.scrim} onPress={close}>
          <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 8 }]}>
            <T weight="semibold" style={styles.sheetTitle}>
              {t('login.chooseCountry')}
            </T>
            <View style={styles.search}>
              <SearchIcon size={18} color={COLORS.muted} />
              <Input
                value={query}
                onChangeText={setQuery}
                placeholder={t('login.searchCountry')}
                autoCorrect={false}
                autoCapitalize="none"
                style={styles.searchInput}
              />
            </View>
            <FlatList
              data={list}
              keyExtractor={item => item.iso}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={20}
              renderItem={({ item }) => {
                const selected = item.iso === country.iso;
                return (
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => {
                      onCountryChange(item);
                      close();
                    }}
                    style={[styles.row, selected && styles.rowSelected]}
                  >
                    <Text style={styles.rowFlag}>{flagOf(item.iso)}</Text>
                    <T weight={selected ? 'semibold' : 'regular'} style={styles.rowName}>
                      {nameOf(item)}
                    </T>
                    <Text style={[styles.rowDial, { fontFamily: fontFor('regular') }]}>
                      {`+${item.dial}`}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={<T style={styles.empty}>{t('portal.noResults')}</T>}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Phone numbers stay left to right in Arabic too.
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    backgroundColor: COLORS.white,
  },
  country: { flexDirection: 'row', alignItems: 'center', gap: 6, height: '100%' },
  flag: { fontSize: 20 },
  dial: { fontSize: 15, color: COLORS.espresso, marginLeft: 10 },
  number: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: COLORS.espresso,
    marginLeft: 8,
    padding: 0,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    height: '75%',
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sheetTitle: { fontSize: 17, marginBottom: 12 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 46,
    paddingHorizontal: 14,
    marginBottom: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.hairline,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    borderWidth: 0,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.hairline,
  },
  rowSelected: { backgroundColor: COLORS.roseSoft, borderRadius: 10 },
  rowFlag: { fontSize: 22 },
  rowName: { flex: 1, fontSize: 15 },
  rowDial: { fontSize: 14, color: COLORS.muted },
  empty: { fontSize: 14, color: COLORS.muted, textAlign: 'center', marginTop: 24 },
});
