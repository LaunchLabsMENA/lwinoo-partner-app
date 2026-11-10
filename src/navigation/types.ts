import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Otp: { channel: 'phone' | 'email' };
  SetupPartner: undefined;
  SetupProfile: undefined;
  SetupSchedule: undefined;
  SetupArea: undefined;
  SetupServices: undefined;
  SetupDocuments: undefined;
  UnderReview: undefined;
};

export type AppNavigation = NativeStackNavigationProp<RootStackParamList>;

export const useAppNavigation = () => useNavigation<AppNavigation>();
