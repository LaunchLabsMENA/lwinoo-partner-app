import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/** The splash picks its own destination, so it is left to finish on its own. */
export const resetToLogin = () => {
  if (!navigationRef.isReady()) {
    return;
  }
  const current = navigationRef.getCurrentRoute()?.name;
  if (current !== 'Splash' && current !== 'Login') {
    navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
  }
};
