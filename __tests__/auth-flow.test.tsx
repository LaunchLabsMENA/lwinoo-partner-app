import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from '../App';
import { store } from '../src/store';
import { logout } from '../src/store/thunks';
import { mockApi, type Reply } from '../test-utils/mock-api';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn(() => Promise.resolve()) },
}));

jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn(() => Promise.resolve(false)),
  setGenericPassword: jest.fn(() => Promise.resolve(true)),
  resetGenericPassword: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));

jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

jest.mock('react-native-video', () => ({ __esModule: true, default: 'Video' }));

type Root = ReactTestRenderer.ReactTestRenderer;

const settle = (ms = 0) =>
  ReactTestRenderer.act(async () => {
    await jest.advanceTimersByTimeAsync(ms);
  });

const text = (root: Root) => JSON.stringify(root.toJSON());

const type = async (root: Root, props: Record<string, string>, value: string) => {
  const [input] = root.root.findAll(
    node =>
      !!node.props.onChangeText &&
      Object.entries(props).every(([key, expected]) => node.props[key] === expected),
  );
  await ReactTestRenderer.act(async () => input.props.onChangeText(value));
};

const press = async (root: Root, label: string) => {
  const [host] = root.root.findAll(
    node => typeof node.type === 'string' && node.props.children === label,
  );
  let node = host.parent;
  while (node && !node.props.onPress) {
    node = node.parent;
  }
  await ReactTestRenderer.act(async () => node?.props.onPress());
  await settle();
};

const me = { id: 'p1', status: 'DRAFT', onboarding: {} };

test('phone login: network failure, wrong code, then success opens setup', async () => {
  jest.useFakeTimers();
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue('1');

  let requestReply: Reply = 'network';
  let verifyReply: Reply = {
    status: 400,
    data: { error: { code: 'OTP_INVALID', message: 'bad', details: { attemptsLeft: 2 } } },
  };
  const bodies: Record<string, unknown> = {};
  mockApi(config => {
    bodies[config.url ?? ''] = JSON.parse(config.data ?? '{}');
    return config.url?.endsWith('request-otp') ? requestReply : verifyReply;
  });

  let root!: Root;
  await ReactTestRenderer.act(async () => {
    root = ReactTestRenderer.create(<App />);
  });
  await settle(1500);
  expect(text(root)).toContain('Login to Account');

  await type(root, { placeholder: '+966 5X XXX XXXX' }, '0512345678');
  await press(root, 'Continue');
  expect(text(root)).toContain('Check your internet connection');

  requestReply = { status: 200, data: { resendAfterSeconds: 60 } };
  await press(root, 'Continue');
  expect(bodies['/api/partner/auth/request-otp']).toEqual({ phone: '+966512345678' });
  expect(text(root)).toContain('Verify Your Number');

  await type(root, { accessibilityLabel: 'OTP Verification' }, '1234');
  await press(root, 'Verify & Continue');
  expect(text(root)).toContain('That code is incorrect. 2 tries left.');

  verifyReply = {
    status: 200,
    data: { accessToken: 'a', refreshToken: 'r', expiresIn: 900, user: me },
  };
  await type(root, { accessibilityLabel: 'OTP Verification' }, '1234');
  await press(root, 'Verify & Continue');
  expect(bodies['/api/partner/auth/verify-otp']).toEqual({ phone: '+966512345678', code: '1234' });
  expect(text(root)).toContain('What kind of partner are you?');

  await ReactTestRenderer.act(async () => {
    await store.dispatch(logout());
  });
  await settle();
  expect(text(root)).toContain('Login to Account');

  await ReactTestRenderer.act(async () => root.unmount());
  jest.useRealTimers();
});
