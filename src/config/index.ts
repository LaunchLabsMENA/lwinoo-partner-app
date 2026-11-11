import { Platform } from 'react-native';

const DEV_API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
const PRODUCTION_API_URL = 'https://api.lwinoo.com';

export const API_BASE_URL = __DEV__ ? DEV_API_URL : PRODUCTION_API_URL;
export const REQUEST_TIMEOUT_MS = 15000;
/** How long launch waits for fresh account data before using the saved copy. */
export const BOOT_TIMEOUT_MS = 6000;
