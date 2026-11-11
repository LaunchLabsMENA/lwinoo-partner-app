/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from '../App';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn(() => Promise.resolve(false)),
  setGenericPassword: jest.fn(() => Promise.resolve(true)),
  resetGenericPassword: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));

jest.mock('react-native-video', () => ({ __esModule: true, default: 'Video' }));

const getItem = AsyncStorage.getItem as jest.Mock;
const setItem = AsyncStorage.setItem as jest.Mock;

const VIDEO_KEY = 'splash_video_seen';

const launch = async () => {
  let root!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    root = ReactTestRenderer.create(<App />);
    await jest.advanceTimersByTimeAsync(0);
  });
  return root;
};

const advance = (ms: number) =>
  ReactTestRenderer.act(async () => {
    await jest.advanceTimersByTimeAsync(ms);
  });

const text = (root: ReactTestRenderer.ReactTestRenderer) =>
  JSON.stringify(root.toJSON());

beforeEach(() => {
  jest.useFakeTimers();
  setItem.mockClear();
});

afterEach(() => {
  jest.useRealTimers();
});

test('first launch plays the video once, then opens login when it ends', async () => {
  getItem.mockResolvedValue(null);
  const root = await launch();
  const video = root.root.findByType('Video' as never);
  expect(setItem).toHaveBeenCalledWith(VIDEO_KEY, '1');
  expect(text(root)).not.toContain('Login to Account');

  await ReactTestRenderer.act(async () => {
    video.props.onEnd();
    await jest.advanceTimersByTimeAsync(0);
  });
  expect(text(root)).toContain('Login to Account');
  await ReactTestRenderer.act(async () => root.unmount());
});

test('later launches skip the video and show the logo before login', async () => {
  getItem.mockImplementation(async (key: string) =>
    key === VIDEO_KEY ? '1' : null,
  );
  const root = await launch();
  expect(root.root.findAllByType('Video' as never)).toHaveLength(0);
  expect(text(root)).not.toContain('Login to Account');

  await advance(1500);
  expect(text(root)).toContain('Login to Account');
  await ReactTestRenderer.act(async () => root.unmount());
});

test('login has a language button that switches to Arabic and back', async () => {
  getItem.mockImplementation(async (key: string) =>
    key === VIDEO_KEY ? '1' : null,
  );
  const root = await launch();
  await advance(1500);

  const press = (label: string) =>
    ReactTestRenderer.act(async () => {
      root.root
        .findAll(node => node.props.accessibilityLabel === label && !!node.props.onPress)[0]
        .props.onPress();
      await jest.advanceTimersByTimeAsync(0);
    });

  await press('التبديل إلى العربية');
  expect(text(root)).toContain('تسجيل الدخول');
  expect(setItem).toHaveBeenCalledWith('lwinoo_lang', 'ar');

  await press('Switch to English');
  expect(text(root)).toContain('Login to Account');
  expect(setItem).toHaveBeenCalledWith('lwinoo_lang', 'en');
  await ReactTestRenderer.act(async () => root.unmount());
});
