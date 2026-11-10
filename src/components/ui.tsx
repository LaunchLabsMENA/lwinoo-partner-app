import React, { FC, ReactNode, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../i18n';
import { COLORS, FontWeightName } from '../theme';
import { ChevronDownIcon } from './icons';

interface TProps extends TextProps {
  weight?: FontWeightName;
  heading?: boolean;
}

export const T: FC<TProps> = ({ weight = 'regular', heading, style, ...rest }) => {
  const { fontFor, isRTL } = useLanguage();
  return (
    <Text
      {...rest}
      style={[
        styles.text,
        { fontFamily: fontFor(weight, heading), textAlign: isRTL ? 'right' : 'left' },
        style,
      ]}
    />
  );
};

export const useComingSoon = () => {
  const { t } = useLanguage();
  return () =>
    Alert.alert(t('common.comingSoon'), t('common.comingSoonBody'), [{ text: t('common.ok') }]);
};

export const PrimaryButton: FC<{
  label: string;
  onPress: () => void;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}> = ({ label, onPress, icon, style }) => {
  const { row } = useLanguage();
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.primary, { flexDirection: row }, style]}
    >
      <T weight="medium" style={styles.primaryLabel}>
        {label}
      </T>
      {icon}
    </TouchableOpacity>
  );
};

export const OutlineButton: FC<{
  label: string;
  onPress: () => void;
  color?: string;
  borderColor?: string;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  weight?: FontWeightName;
}> = ({
  label,
  onPress,
  color = COLORS.rose,
  borderColor = COLORS.rose,
  backgroundColor = COLORS.white,
  style,
  weight = 'semibold',
}) => (
  <TouchableOpacity
    activeOpacity={0.8}
    accessibilityRole="button"
    onPress={onPress}
    style={[styles.outline, { borderColor, backgroundColor }, style]}
  >
    <T weight={weight} style={[styles.outlineLabel, { color }]}>
      {label}
    </T>
  </TouchableOpacity>
);

export const FieldLabel: FC<{ children: string; style?: StyleProp<TextStyle> }> = ({
  children,
  style,
}) => (
  <T weight="medium" style={[styles.label, style]}>
    {children}
  </T>
);

export const Input: FC<TextInputProps> = ({ style, ...rest }) => {
  const { fontFor, isRTL } = useLanguage();
  return (
    <TextInput
      placeholderTextColor={COLORS.placeholder}
      {...rest}
      style={[
        styles.input,
        { fontFamily: fontFor('regular'), textAlign: isRTL ? 'right' : 'left' },
        style,
      ]}
    />
  );
};

export const LabeledInput: FC<TextInputProps & { label: string }> = ({ label, ...rest }) => (
  <View style={styles.field}>
    <FieldLabel>{label}</FieldLabel>
    <Input {...rest} />
  </View>
);

/** Saudi Arabia is the only market, so the country is fixed rather than a picker. */
export const PhoneInput: FC<TextInputProps> = ({ style, ...rest }) => {
  const { fontFor } = useLanguage();
  return (
    <View style={[styles.input, styles.phone, style]}>
      <Text style={styles.flag}>🇸🇦</Text>
      <ChevronDownIcon size={16} />
      <TextInput
        placeholder="+966 5X XXX XXXX"
        placeholderTextColor={COLORS.placeholder}
        keyboardType="phone-pad"
        maxLength={16}
        {...rest}
        style={[styles.phoneText, { fontFamily: fontFor('regular') }]}
      />
    </View>
  );
};

export const Chip: FC<{
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}> = ({ label, selected, onPress, style }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityState={{ selected }}
    onPress={onPress}
    style={[styles.chip, selected && styles.chipSelected, style]}
  >
    <T style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</T>
  </TouchableOpacity>
);

export const Radio: FC<{ selected: boolean }> = ({ selected }) => (
  <View style={[styles.radio, selected && styles.radioSelected]}>
    {selected ? <View style={styles.radioDot} /> : null}
  </View>
);

export const SelectField: FC<{
  label: string;
  placeholder: string;
  value: string | null;
  options: { id: string; label: string }[];
  onChange: (id: string) => void;
}> = ({ label, placeholder, value, options, onChange }) => {
  const insets = useSafeAreaInsets();
  const { row } = useLanguage();
  const [open, setOpen] = useState(false);
  const current = options.find(option => option.id === value);

  return (
    <View style={styles.field}>
      <FieldLabel>{label}</FieldLabel>
      <TouchableOpacity
        activeOpacity={0.8}
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        style={[styles.input, styles.select, { flexDirection: row }]}
      >
        <T style={[styles.selectText, !current && styles.selectPlaceholder]}>
          {current?.label ?? placeholder}
        </T>
        <ChevronDownIcon size={18} />
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.scrim} onPress={() => setOpen(false)}>
          <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
            <T weight="semibold" style={styles.sheetTitle}>
              {label}
            </T>
            <ScrollView>
              {options.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.sheetRow}
                  onPress={() => {
                    onChange(option.id);
                    setOpen(false);
                  }}
                >
                  <T
                    weight={option.id === value ? 'semibold' : 'regular'}
                    style={styles.sheetOption}
                  >
                    {option.label}
                  </T>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  text: { color: COLORS.espresso },
  primary: {
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.espresso,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryLabel: { color: COLORS.white, fontSize: 16 },
  outline: {
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineLabel: { fontSize: 14 },
  field: { marginTop: 14 },
  label: { fontSize: 12, marginBottom: 8 },
  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    fontSize: 15,
    color: COLORS.espresso,
  },
  phone: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  flag: { fontSize: 20 },
  phoneText: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: COLORS.espresso,
    marginLeft: 4,
    padding: 0,
  },
  chip: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  chipSelected: { backgroundColor: COLORS.rose, borderColor: COLORS.rose },
  chipLabel: { fontSize: 14, textAlign: 'center' },
  chipLabelSelected: { color: COLORS.white },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: COLORS.roseSoft,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { backgroundColor: COLORS.rose, borderColor: COLORS.rose },
  radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: COLORS.white },
  select: { alignItems: 'center', justifyContent: 'space-between' },
  selectText: { fontSize: 15, flex: 1 },
  selectPlaceholder: { color: COLORS.placeholder },
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: '60%',
  },
  sheetTitle: { fontSize: 17, marginBottom: 8 },
  sheetRow: {
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.hairline,
  },
  sheetOption: { fontSize: 15 },
});
