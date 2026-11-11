import React, { FC } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OtpScreen } from '../screens/auth/otp';
import { LoginScreen } from '../screens/auth/login';
import { SplashScreen } from '../screens/intro/splash';
import { AreaScreen } from '../screens/setup/area';
import { DocumentsScreen } from '../screens/setup/documents';
import { PartnerScreen } from '../screens/setup/partner';
import { PayoutScreen } from '../screens/setup/payout';
import { ProfileScreen } from '../screens/setup/profile';
import { ScheduleScreen } from '../screens/setup/schedule';
import { ServiceFormScreen } from '../screens/setup/service-form';
import { ServicesScreen } from '../screens/setup/services';
import { UnderReviewScreen } from '../screens/setup/under-review';
import { MainTabs } from './tabs';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: FC = () => (
  <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Splash" component={SplashScreen} options={{ animation: 'none' }} />
    <Stack.Screen name="Login" component={LoginScreen} options={{ animation: 'fade' }} />
    <Stack.Screen name="Otp" component={OtpScreen} />
    <Stack.Screen name="SetupPartner" component={PartnerScreen} />
    <Stack.Screen name="SetupProfile" component={ProfileScreen} />
    <Stack.Screen name="SetupSchedule" component={ScheduleScreen} />
    <Stack.Screen name="SetupArea" component={AreaScreen} />
    <Stack.Screen name="SetupServices" component={ServicesScreen} />
    <Stack.Screen name="SetupDocuments" component={DocumentsScreen} />
    <Stack.Screen name="SetupPayout" component={PayoutScreen} />
    <Stack.Screen name="ServiceForm" component={ServiceFormScreen} />
    <Stack.Screen
      name="UnderReview"
      component={UnderReviewScreen}
      options={{ gestureEnabled: false }}
    />
    <Stack.Screen
      name="Main"
      component={MainTabs}
      options={{ animation: 'fade', gestureEnabled: false }}
    />
  </Stack.Navigator>
);
