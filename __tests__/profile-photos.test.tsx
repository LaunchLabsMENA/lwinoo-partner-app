import React from 'react';
import { Alert, Image, Linking } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { LanguageProvider } from '../src/i18n';
import { ProfileScreen } from '../src/screens/setup/profile';
import { createAppStore } from '../src/store';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(() => Promise.resolve(null)), setItem: jest.fn() },
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

let mockUploads = 0;
jest.mock('../src/api/business', () => ({
  uploadFile: jest.fn(async (_file: unknown, _purpose: string, baseUrl?: string) => {
    mockUploads += 1;
    return { fileId: `f${mockUploads}`, url: `${baseUrl}/api/files/f${mockUploads}` };
  }),
}));

jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));

const alertSpy = jest.spyOn(Alert, 'alert');

const render = async () => {
  let root!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    root = ReactTestRenderer.create(
      <LanguageProvider>
        <Provider store={createAppStore()}>
          <NavigationContainer>
            <ProfileScreen />
          </NavigationContainer>
        </Provider>
      </LanguageProvider>,
    );
  });
  return root;
};

const press = (root: ReactTestRenderer.ReactTestRenderer, label: string) =>
  ReactTestRenderer.act(async () => {
    root.root
      .findAll(node => node.props.accessibilityLabel === label && !!node.props.onPress)[0]
      .props.onPress();
  });

const chooseOption = (index: number) =>
  ReactTestRenderer.act(async () => {
    await alertSpy.mock.lastCall?.[2]?.[index].onPress?.();
  });

const imageUris = (root: ReactTestRenderer.ReactTestRenderer) =>
  root.root.findAllByType(Image).map(image => image.props.source.uri);

beforeEach(() => alertSpy.mockClear());

test('profile photo and cover each show the picture chosen from the library', async () => {
  const root = await render();
  (launchImageLibrary as jest.Mock).mockResolvedValueOnce({ assets: [{ uri: 'file://photo.jpg' }] });
  await press(root, 'Add a profile photo');
  await chooseOption(1);

  (launchImageLibrary as jest.Mock).mockResolvedValueOnce({ assets: [{ uri: 'file://cover.jpg' }] });
  await press(root, 'Cover picture');
  await chooseOption(1);

  expect(imageUris(root)).toEqual([
    'https://moisture-granola-underwent.ngrok-free.dev/api/files/f1',
    'https://moisture-granola-underwent.ngrok-free.dev/api/files/f2',
  ]);
  await ReactTestRenderer.act(async () => root.unmount());
});

test('a denied camera offers Settings and adds no picture', async () => {
  const openSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValue();
  const root = await render();
  (launchCamera as jest.Mock).mockResolvedValueOnce({ errorCode: 'permission' });
  await press(root, 'Add a profile photo');
  jest.useFakeTimers();
  await chooseOption(0);
  await ReactTestRenderer.act(async () => {
    await jest.advanceTimersByTimeAsync(500);
  });
  jest.useRealTimers();

  expect(alertSpy.mock.lastCall?.[0]).toBe('Camera access is off');
  await chooseOption(1);
  expect(openSettings).toHaveBeenCalled();
  expect(imageUris(root)).toEqual([]);
  await ReactTestRenderer.act(async () => root.unmount());
});
