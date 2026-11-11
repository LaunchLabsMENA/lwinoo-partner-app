import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from '../App';
import { store } from '../src/store';
import { logout } from '../src/store/thunks';
import { fail, mockApi, ok, route, type Reply } from '../test-utils/mock-api';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn(() => Promise.resolve()) },
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

const PARTNER_TYPES = [
  {
    id: 'ptype_beauty_services',
    slug: 'beauty-services',
    nameEn: 'Beauty & Services',
    nameAr: null,
    descriptionEn: 'Salon, makeup artist, spa or at-home expert',
    descriptionAr: null,
    imageUrl: null,
    requiredDocuments: ['NATIONAL_ID'],
    requiresCategories: true,
  },
];

test('a new number signs up: network failure, wrong code, then setup opens on step 1', async () => {
  jest.useFakeTimers();
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue('1');

  let requestReply: Reply = 'network';
  let verifyReply: Reply = fail(400, 'OTP_INVALID', 'Incorrect code. 2 attempts left');
  const calls: string[] = [];
  mockApi(config => {
    calls.push(route(config));
    if (config.url?.endsWith('/partner-types')) return ok(PARTNER_TYPES);
    if (config.url?.endsWith('/categories')) return ok([]);
    if (config.url?.includes('/login/request-otp')) {
      return requestReply === 'network' ? requestReply : fail(404, 'ACCOUNT_NOT_FOUND');
    }
    if (config.url?.includes('/signup/request-otp')) return requestReply;
    if (config.url?.includes('/signup/verify-otp')) return verifyReply;
    return 'network';
  });

  let root!: Root;
  await ReactTestRenderer.act(async () => {
    root = ReactTestRenderer.create(<App />);
  });
  await settle(1500);
  expect(text(root)).toContain('Login to Account');

  await type(root, { placeholder: '51 234 5678' }, '0512345678');
  await press(root, 'Continue');
  expect(text(root)).toContain('Check your internet connection');

  requestReply = ok({ channel: 'phone', identifier: '+966512345678', expiresIn: 300, resendAfter: 60 });
  await press(root, 'Continue');
  expect(text(root)).toContain('Verify Your Number');

  await type(root, { accessibilityLabel: 'OTP Verification' }, '1234');
  await press(root, 'Verify & Continue');
  expect(text(root)).toContain('That code is incorrect. 2 tries left.');

  verifyReply = ok({
    user: { id: 'u1', email: null, phone: '+966512345678', fullName: null, avatar: null, role: 'BUSINESS' },
    accessToken: 'a',
    refreshToken: 'r',
    expiresIn: '15m',
    isNewUser: true,
    nextAction: 'BUSINESS_SETUP',
    business: null,
  });
  await type(root, { accessibilityLabel: 'OTP Verification' }, '1234');
  await press(root, 'Verify & Continue');
  expect(calls).toContain('POST /api/business/auth/signup/verify-otp');
  expect(text(root)).toContain('What kind of partner are you?');
  expect(text(root)).toContain('Beauty & Services');

  await ReactTestRenderer.act(async () => {
    await store.dispatch(logout());
  });
  await settle();
  expect(text(root)).toContain('Login to Account');

  await ReactTestRenderer.act(async () => root.unmount());
  jest.useRealTimers();
});

test('picking another country sends that country\'s number', async () => {
  jest.useFakeTimers();
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue('1');
  const bodies: unknown[] = [];
  mockApi(config => {
    if (config.url?.includes('request-otp')) {
      bodies.push(JSON.parse(config.data));
      return fail(503, 'OTP_DELIVERY_FAILED');
    }
    return 'network';
  });

  let root!: Root;
  await ReactTestRenderer.act(async () => {
    root = ReactTestRenderer.create(<App />);
  });
  await settle(1500);

  const [countryButton] = root.root.findAll(
    node => node.props.accessibilityLabel === 'Country: Saudi Arabia' && !!node.props.onPress,
  );
  await ReactTestRenderer.act(async () => countryButton.props.onPress());
  await type(root, { placeholder: 'Search country or code' }, '971');
  await press(root, 'United Arab Emirates');
  expect(text(root)).toContain('+971');

  await type(root, { placeholder: '50 123 4567' }, '050 123 4567');
  await press(root, 'Continue');
  expect(bodies[0]).toEqual({ channel: 'phone', identifier: '+971501234567' });
  expect(text(root)).toContain('We could not send the code');

  await ReactTestRenderer.act(async () => root.unmount());
  jest.useRealTimers();
});
