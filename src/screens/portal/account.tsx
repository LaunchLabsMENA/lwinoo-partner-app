import React, { FC, ReactNode, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  BellIcon,
  ChevronRightIcon,
  GlobeIcon,
  IconProps,
  LinkIcon,
  LockIcon,
  ShieldOutlineIcon,
  TrashIcon,
} from '../../components/icons';
import { PartnerIdentity, PortalScreen } from '../../components/portal';
import { LanguageToggle, T, useComingSoon } from '../../components/ui';
import { useLanguage } from '../../i18n';
import { TKey } from '../../i18n/translations';
import { useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/thunks';
import { COLORS } from '../../theme';

const SettingRow: FC<{
  label: TKey;
  Icon: FC<IconProps>;
  onPress?: () => void;
  trailing?: ReactNode;
}> = ({ label, Icon, onPress, trailing }) => {
  const { t, row, isRTL } = useLanguage();
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={[styles.row, { flexDirection: row }]}
    >
      <View style={styles.rowIcon}>
        <Icon size={16} color={COLORS.rose} />
      </View>
      <T style={styles.rowLabel}>{t(label)}</T>
      {trailing ?? (
        <View style={isRTL ? styles.flipped : undefined}>
          <ChevronRightIcon size={16} color={COLORS.muted} />
        </View>
      )}
    </TouchableOpacity>
  );
};

export const AccountScreen: FC = () => {
  const dispatch = useAppDispatch();
  const { t, row } = useLanguage();
  const comingSoon = useComingSoon();
  const [twoFactor, setTwoFactor] = useState(true);

  return (
    <PortalScreen title={t('account.title')}>
      <View style={[styles.partner, { flexDirection: row }]}>
        <PartnerIdentity inverted />
      </View>

      <SettingRow label="account.password" Icon={LockIcon} onPress={comingSoon} />
      <SettingRow
        label="account.twoFactor"
        Icon={ShieldOutlineIcon}
        trailing={
          <TouchableOpacity
            activeOpacity={0.8}
            accessibilityRole="switch"
            accessibilityLabel={t('account.twoFactor')}
            accessibilityState={{ checked: twoFactor }}
            hitSlop={10}
            onPress={() => setTwoFactor(current => !current)}
            style={[styles.toggle, twoFactor && styles.toggleOn]}
          >
            <View style={styles.toggleThumb} />
          </TouchableOpacity>
        }
      />
      <SettingRow label="account.connected" Icon={LinkIcon} onPress={comingSoon} />
      <SettingRow label="account.push" Icon={BellIcon} onPress={comingSoon} />
      <SettingRow label="account.language" Icon={GlobeIcon} trailing={<LanguageToggle />} />

      <T weight="medium" style={styles.danger}>
        {t('account.danger')}
      </T>
      <TouchableOpacity
        activeOpacity={0.8}
        accessibilityRole="button"
        onPress={comingSoon}
        style={[styles.dangerButton, styles.centered]}
      >
        <T weight="medium" style={styles.dangerLabel}>
          {t('account.deactivate')}
        </T>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.8}
        accessibilityRole="button"
        onPress={comingSoon}
        style={[styles.dangerButton, styles.spread, { flexDirection: row }]}
      >
        <T weight="medium" style={styles.dangerLabel}>
          {t('account.delete')}
        </T>
        <TrashIcon size={20} color={COLORS.danger} />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.85}
        accessibilityRole="button"
        onPress={() => dispatch(logout())}
        style={styles.logOut}
      >
        <T weight="medium" style={styles.logOutLabel}>
          {t('account.logout')}
        </T>
      </TouchableOpacity>
    </PortalScreen>
  );
};

const styles = StyleSheet.create({
  partner: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: COLORS.espresso,
  },
  row: {
    height: 54,
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  rowIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: COLORS.roseSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { flex: 1, fontSize: 13.5 },
  flipped: { transform: [{ scaleX: -1 }] },
  toggle: {
    width: 40,
    height: 22,
    borderRadius: 11,
    padding: 2,
    alignItems: 'flex-start',
    backgroundColor: COLORS.roseSoft,
  },
  toggleOn: { alignItems: 'flex-end', backgroundColor: COLORS.rose },
  toggleThumb: { width: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.white },
  danger: { fontSize: 13, color: COLORS.danger, marginTop: 18, marginBottom: 2 },
  dangerButton: {
    height: 56,
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.danger,
    paddingHorizontal: 16,
  },
  centered: { alignItems: 'center', justifyContent: 'center' },
  spread: { alignItems: 'center', justifyContent: 'space-between' },
  dangerLabel: { fontSize: 15, color: COLORS.danger },
  logOut: {
    height: 56,
    marginTop: 40,
    borderRadius: 14,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logOutLabel: { fontSize: 15, color: COLORS.white },
});
