import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { http } from './src/api/client';

// Native modules the screens import; tests that care replace these with their own mocks.
jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  const Map = (props: object) => require('react').createElement(View, props);
  return { __esModule: true, default: Map, Circle: View };
});

jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn(() => Promise.resolve(false)),
  setGenericPassword: jest.fn(() => Promise.resolve(true)),
  resetGenericPassword: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));

// No test reaches the real network: unmocked calls fail like an offline phone.
const offline = async (config: InternalAxiosRequestConfig) => {
  throw new AxiosError('Network Error', 'ERR_NETWORK', config);
};
http.defaults.adapter = offline;
axios.defaults.adapter = offline;
