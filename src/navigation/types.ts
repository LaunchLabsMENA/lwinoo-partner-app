import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Otp: { channel: 'phone' | 'email'; target: string; mode: 'login' | 'signup' };
  SetupPartner: undefined;
  SetupProfile: undefined;
  SetupSchedule: undefined;
  SetupArea: undefined;
  SetupServices: undefined;
  SetupDocuments: undefined;
  SetupPayout: undefined;
  ServiceForm: { serviceId?: string } | undefined;
  UnderReview: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Overview: undefined;
  Bookings: undefined;
  Services: undefined;
  Calendar: undefined;
  Profile: undefined;
};

export type AppNavigation = NativeStackNavigationProp<RootStackParamList>;

export const useAppNavigation = () => useNavigation<AppNavigation>();
