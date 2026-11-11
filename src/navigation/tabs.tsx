import React, { FC } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BookIcon,
  CalendarIcon,
  HairDryerIcon,
  HomeIcon,
  IconProps,
  UserIcon,
} from '../components/icons';
import { T } from '../components/ui';
import { useLanguage } from '../i18n';
import { TKey } from '../i18n/translations';
import { AccountScreen } from '../screens/portal/account';
import { BookingsScreen } from '../screens/portal/bookings';
import { CalendarScreen } from '../screens/portal/calendar';
import { OverviewScreen } from '../screens/portal/overview';
import { PortalServicesScreen } from '../screens/portal/services';
import { COLORS } from '../theme';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ITEMS: Record<keyof MainTabParamList, { label: TKey; Icon: FC<IconProps> }> = {
  Overview: { label: 'tabs.home', Icon: HomeIcon },
  Bookings: { label: 'tabs.bookings', Icon: BookIcon },
  Services: { label: 'tabs.services', Icon: HairDryerIcon },
  Calendar: { label: 'tabs.calendar', Icon: CalendarIcon },
  Profile: { label: 'tabs.profile', Icon: UserIcon },
};

const PortalTabBar: FC<BottomTabBarProps> = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();
  const { t, row } = useLanguage();

  return (
    <View style={[styles.bar, { flexDirection: row, paddingBottom: Math.max(insets.bottom, 12) }]}>
      {state.routes.map((route, index) => {
        const { label, Icon } = TAB_ITEMS[route.name as keyof MainTabParamList];
        const focused = state.index === index;
        const color = focused ? COLORS.rose : COLORS.muted;
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
        return (
          <TouchableOpacity
            key={route.key}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            onPress={onPress}
            style={styles.item}
          >
            <Icon size={24} color={color} />
            <T style={[styles.label, { color }]}>{t(label)}</T>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const renderTabBar = (props: BottomTabBarProps) => <PortalTabBar {...props} />;

export const MainTabs: FC = () => (
  <Tab.Navigator tabBar={renderTabBar} screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Overview" component={OverviewScreen} />
    <Tab.Screen name="Bookings" component={BookingsScreen} />
    <Tab.Screen name="Services" component={PortalServicesScreen} />
    <Tab.Screen name="Calendar" component={CalendarScreen} />
    <Tab.Screen name="Profile" component={AccountScreen} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  bar: {
    paddingTop: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.hairline,
  },
  item: { flex: 1, alignItems: 'center', gap: 4 },
  label: { fontSize: 11, textAlign: 'center' },
});
