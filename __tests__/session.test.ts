const mockKeychain = new Map<string, string>();

jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn(({ service }: { service: string }) =>
    Promise.resolve(
      mockKeychain.has(service) ? { username: 'session', password: mockKeychain.get(service) } : false,
    ),
  ),
  setGenericPassword: jest.fn((_user: string, password: string, { service }: { service: string }) => {
    mockKeychain.set(service, password);
    return Promise.resolve(true);
  }),
  resetGenericPassword: jest.fn(({ service }: { service: string }) => {
    mockKeychain.delete(service);
    return Promise.resolve(true);
  }),
}));

import { http } from '../src/api/client';
import { apiError, errorMessage, toApiError } from '../src/api/errors';
import type { PartnerMe } from '../src/api/types';
import { routeFor } from '../src/navigation/route-for';
import { formLoaded, fromOnboarding, INITIAL_FORM, toOnboarding } from '../src/state/setup';
import { validateSetup } from '../src/state/validate';
import { createAppStore, type AppStore } from '../src/store';
import { sessionCleared, sessionStarted } from '../src/store/session';
import { bootstrap, logout, saveDraft, submitApplication, verifyOtp } from '../src/store/thunks';
import { mockApi } from '../test-utils/mock-api';

const me = (status: PartnerMe['status']): PartnerMe =>
  ({ id: 'p1', status, onboarding: { ownerName: 'Sara' } }) as unknown as PartnerMe;

const tokens = { accessToken: 'old', refreshToken: 'r1' };

const complete = {
  ...INITIAL_FORM,
  ownerName: 'Sara Ali',
  businessName: 'Glow Studio',
  phone: '512345678',
  services: ['hair'],
  city: 'riyadh',
  address: 'olaya',
  days: ['sun'],
  documents: [{ type: 'id' as const, url: 'https://cdn.example/id.jpg' }],
};

const flush = () => new Promise<void>(resolve => setTimeout(() => resolve(), 0));

let store: AppStore;

beforeEach(() => {
  mockKeychain.clear();
  store = createAppStore();
});

const signIn = () => store.dispatch(sessionStarted({ tokens, me: me('DRAFT') }));

test('a session survives a restart through the keychain', async () => {
  signIn();
  await flush();
  const restarted = createAppStore();
  await restarted.dispatch(bootstrap());
  expect(restarted.getState().session.tokens).toEqual(tokens);
});

test('clearing the session wipes stored credentials and the form', async () => {
  signIn();
  store.dispatch(formLoaded({ ownerName: 'Sara' }));
  await flush();
  store.dispatch(sessionCleared());
  await flush();
  expect(mockKeychain.size).toBe(0);
  expect(store.getState().setup.form.ownerName).toBe('');
});

test('a 401 refreshes once for parallel requests and retries them', async () => {
  signIn();
  let refreshes = 0;
  mockApi(config => {
    if (config.url?.endsWith('/api/auth/refresh')) {
      refreshes += 1;
      return { status: 200, data: { accessToken: 'new', refreshToken: 'r2', expiresIn: 900 } };
    }
    return config.headers.Authorization === 'Bearer new'
      ? { status: 200, data: 'ok' }
      : { status: 401 };
  });
  const answers = await Promise.all([http.get('/a'), http.get('/b')]);
  expect(answers.map(answer => answer.data)).toEqual(['ok', 'ok']);
  expect(refreshes).toBe(1);
  expect(store.getState().session.tokens).toEqual({ accessToken: 'new', refreshToken: 'r2' });
});

test('a rejected refresh ends the session', async () => {
  signIn();
  mockApi(() => ({ status: 401 }));
  await expect(http.get('/a')).rejects.toBeTruthy();
  expect(store.getState().session.tokens).toBeNull();
});

test('losing the connection during a refresh keeps the session', async () => {
  signIn();
  mockApi(config => (config.url?.endsWith('/api/auth/refresh') ? 'network' : { status: 401 }));
  await expect(http.get('/a')).rejects.toBeTruthy();
  expect(store.getState().session.tokens).toEqual(tokens);
});

test('logging out during a refresh does not bring the session back', async () => {
  signIn();
  mockApi(config => {
    if (config.url?.endsWith('/api/auth/refresh')) {
      store.dispatch(sessionCleared());
      return { status: 200, data: { accessToken: 'new', refreshToken: 'r2', expiresIn: 900 } };
    }
    return { status: 401 };
  });
  await expect(http.get('/a')).rejects.toBeTruthy();
  expect(store.getState().session.tokens).toBeNull();
});

test('logout clears locally even when the server is unreachable', async () => {
  signIn();
  mockApi(() => 'network');
  await store.dispatch(logout());
  expect(store.getState().session.tokens).toBeNull();
});

test('launch uses the saved account when the server is unreachable', async () => {
  signIn();
  await flush();
  mockApi(() => 'network');
  const restarted = createAppStore();
  await expect(restarted.dispatch(bootstrap()).unwrap()).resolves.toBe('SetupPartner');
  expect(restarted.getState().setup.form.ownerName).toBe('Sara');
});

test('launch signs out when the server rejects the account', async () => {
  signIn();
  await flush();
  mockApi(() => ({ status: 403, data: { error: { code: 'ACCOUNT_BLOCKED' } } }));
  const restarted = createAppStore();
  await expect(restarted.dispatch(bootstrap()).unwrap()).resolves.toBe('Login');
  expect(restarted.getState().session.tokens).toBeNull();
});

test('a failed draft save is reported, and clears after the next success', async () => {
  signIn();
  mockApi(() => 'network');
  await store.dispatch(saveDraft());
  expect(store.getState().setup.draftFailed).toBe(true);
  mockApi(() => ({ status: 200, data: me('DRAFT') }));
  await store.dispatch(saveDraft());
  expect(store.getState().setup.draftFailed).toBe(false);
});

test('submit saves the latest form first, and reports a refusal', async () => {
  signIn();
  const calls: string[] = [];
  mockApi(config => {
    calls.push(`${config.method} ${config.url}`);
    return { status: 200, data: me('PENDING_VERIFICATION') };
  });
  await store.dispatch(submitApplication()).unwrap();
  expect(calls).toEqual(['put /api/partner/onboarding', 'post /api/partner/onboarding/submit']);
  expect(store.getState().session.me?.status).toBe('PENDING_VERIFICATION');

  mockApi(() => ({ status: 409, data: { error: { code: 'ONBOARDING_LOCKED', message: 'no' } } }));
  const action = await store.dispatch(submitApplication());
  expect(action.payload).toEqual(expect.objectContaining({ code: 'ONBOARDING_LOCKED' }));
});

test('a failed thunk rejects with a readable error', async () => {
  mockApi(() => ({
    status: 400,
    data: { error: { code: 'OTP_INVALID', message: 'bad', details: { attemptsLeft: 2 } } },
  }));
  const action = await store.dispatch(verifyOtp({ method: 'phone', target: '+966', code: '1234' }));
  expect(action.payload).toEqual(
    expect.objectContaining({ code: 'OTP_INVALID', details: { attemptsLeft: 2 } }),
  );
});

test('routeFor matches each application status', () => {
  expect(routeFor(me('DRAFT'))).toBe('SetupPartner');
  expect(routeFor(me('CHANGES_REQUESTED'))).toBe('SetupPartner');
  expect(routeFor(me('PENDING_VERIFICATION'))).toBe('UnderReview');
  expect(routeFor(me('REJECTED'))).toBe('UnderReview');
  expect(routeFor(me('APPROVED'))).toBe('Main');
  expect(routeFor(me('ACTIVE'))).toBe('Main');
});

test('validateSetup accepts a complete form and flags gaps', () => {
  expect(validateSetup(complete)).toBeNull();
  expect(validateSetup({ ...complete, ownerName: '' })).toEqual({
    key: 'required',
    field: 'profile.owner',
  });
  expect(validateSetup({ ...complete, documents: [] })).toEqual({ key: 'documents' });
  expect(validateSetup({ ...complete, timeStart: '9am' })).toEqual({ key: 'time' });
});

test('onboarding data round-trips and null fields keep their defaults', () => {
  expect(fromOnboarding(toOnboarding(complete))).toEqual(complete);
  expect(fromOnboarding({ documents: null, days: null } as never)).toEqual(INITIAL_FORM);
});

test('errors map to readable messages', () => {
  const t = ((key: string) => key) as never;
  expect(errorMessage(apiError('NETWORK_ERROR', '', 0), t)).toBe('error.network');
  expect(errorMessage(apiError('UPLOAD_FAILED', '', -1), t)).toBe('error.uploadFailed');
  expect(errorMessage(new Error('nope'), t)).toBe('error.generic');
  expect(toApiError(apiError('X', 'boom', 500)).status).toBe(500);
});
