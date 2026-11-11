import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { LanguageProvider } from '../src/i18n';
import { MainTabs } from '../src/navigation/tabs';
import { createAppStore } from '../src/store';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(() => Promise.resolve(null)), setItem: jest.fn(() => Promise.resolve()) },
}));

jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn(() => Promise.resolve(false)),
  setGenericPassword: jest.fn(() => Promise.resolve(true)),
  resetGenericPassword: jest.fn(() => Promise.resolve(true)),
}));

jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

const EXPECTED_BY_TAB = [
  'BOOKINGS TODAY',
  'Amina Qurban',
  'Add New Service',
  'Block Slot',
  'Two-Factor Authentication',
];

test('each navbar tab opens its screen', async () => {
  jest.useFakeTimers();
  let root!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    root = ReactTestRenderer.create(
      <LanguageProvider>
        <Provider store={createAppStore()}>
          <NavigationContainer>
            <MainTabs />
          </NavigationContainer>
        </Provider>
      </LanguageProvider>,
    );
    await jest.advanceTimersByTimeAsync(0);
  });

  const tabs = () =>
    root.root.findAll(node => node.props.accessibilityRole === 'tab' && !!node.props.onPress, {
      deep: false,
    });
  expect(tabs()).toHaveLength(EXPECTED_BY_TAB.length);

  for (const [index, expected] of EXPECTED_BY_TAB.entries()) {
    await ReactTestRenderer.act(async () => {
      tabs()[index].props.onPress();
      await jest.advanceTimersByTimeAsync(0);
    });
    expect(JSON.stringify(root.toJSON())).toContain(expected);
  }

  await ReactTestRenderer.act(async () => {
    root.root
      .findAll(
        node => node.props.accessibilityLabel === 'التبديل إلى العربية' && !!node.props.onPress,
      )[0]
      .props.onPress();
    await jest.advanceTimersByTimeAsync(0);
  });
  expect(JSON.stringify(root.toJSON())).toContain('تسجيل الخروج');

  await ReactTestRenderer.act(async () => root.unmount());
  jest.useRealTimers();
});
