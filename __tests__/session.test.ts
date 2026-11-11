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
import type { Account, BusinessSetup } from '../src/api/types';
import { routesFor } from '../src/navigation/route-for';
import {
  formPatched,
  fromSetup,
  INITIAL_FORM,
  normalizePhone,
  setupLoaded,
  toProfileInput,
  toSchedule,
} from '../src/state/setup';
import { createAppStore, type AppStore } from '../src/store';
import { sessionCleared, sessionStarted } from '../src/store/session';
import {
  attachDocument,
  bootstrap,
  logout,
  requestOtp,
  saveProfile,
  uploadFile,
  verifyOtp,
} from '../src/store/thunks';
import { fail, mockApi, ok, route } from '../test-utils/mock-api';

const account = (nextAction: Account['nextAction'], setupStep?: string): Account => ({
  user: { id: 'u1', email: null, phone: '+966512345678', fullName: null, avatar: null, role: 'BUSINESS' },
  business: setupStep
    ? ({ id: 'b1', status: 'DRAFT', setupStep, name: 'Glow', rejectionReason: null } as Account['business'])
    : null,
  nextAction,
});

const setup = (overrides: Partial<NonNullable<BusinessSetup['business']>> = {}): BusinessSetup => ({
  business: {
    id: 'b1',
    partnerType: { id: 'ptype_beauty_services', requiredDocuments: ['COMMERCIAL_REGISTRATION'], requiresCategories: true },
    status: 'DRAFT',
    setupStep: 'SCHEDULE',
    rejectionReason: null,
    statusReason: null,
    submittedAt: null,
    reviewedAt: null,
    logoUrl: '/api/files/logo1',
    coverUrl: null,
    ownerName: 'Noura',
    name: 'Nour Beauty',
    description: null,
    phone: '+966512345678',
    categories: [{ id: 'c1', slug: 'hair', nameEn: 'Hair', nameAr: null }],
    city: 'Riyadh',
    district: null,
    street: 'King Fahd Road',
    teamSize: 'SOLO',
    serviceLocation: null,
    latitude: null,
    longitude: null,
    serviceRadiusKm: null,
    crNumber: '1010123456',
    bankName: null,
    iban: null,
    termsAcceptedAt: null,
    ...overrides,
  },
  schedule: [{ dayOfWeek: 0, start: '09:00', end: '18:00', breakStart: null, breakEnd: null }],
  services: [],
  documents: [],
  progress: {},
});

const tokens = { accessToken: 'old', refreshToken: 'r1' };
const flush = () => new Promise<void>(resolve => setTimeout(() => resolve(), 0));

let store: AppStore;

beforeEach(() => {
  mockKeychain.clear();
  store = createAppStore();
});

const signIn = (next: Account = account('BUSINESS_SETUP')) =>
  store.dispatch(sessionStarted({ tokens, account: next }));

test('successful answers are unwrapped from the envelope', async () => {
  mockApi(() => ok({ hello: 'world' }));
  expect((await http.get('/x')).data).toEqual({ hello: 'world' });
});

test('a 401 refreshes once for parallel requests and retries them with the new token', async () => {
  signIn();
  let refreshes = 0;
  mockApi(config => {
    if (config.url?.endsWith('/api/auth/refresh')) {
      refreshes += 1;
      // The refresh answer is not wrapped in `data`.
      return { status: 200, data: { success: true, accessToken: 'new', refreshToken: 'r2', expiresIn: 900 } };
    }
    return config.headers.Authorization === 'Bearer new' ? ok('ok') : fail(401, 'UNAUTHORIZED');
  });
  const answers = await Promise.all([http.get('/api/business'), http.get('/api/auth/me')]);
  expect(answers.map(answer => answer.data)).toEqual(['ok', 'ok']);
  expect(refreshes).toBe(1);
  expect(store.getState().session.tokens).toEqual({ accessToken: 'new', refreshToken: 'r2' });
});

test('a rejected refresh ends the session; a lost connection keeps it', async () => {
  signIn();
  mockApi(config => (config.url?.endsWith('/refresh') ? 'network' : fail(401, 'UNAUTHORIZED')));
  await expect(http.get('/api/business')).rejects.toBeTruthy();
  expect(store.getState().session.tokens).toEqual(tokens);

  mockApi(() => fail(401, 'UNAUTHORIZED'));
  await expect(http.get('/api/business')).rejects.toBeTruthy();
  expect(store.getState().session.tokens).toBeNull();
});

test('logging out during a refresh does not bring the session back', async () => {
  signIn();
  mockApi(config => {
    if (config.url?.endsWith('/api/auth/refresh')) {
      store.dispatch(sessionCleared());
      return { status: 200, data: { accessToken: 'new', refreshToken: 'r2' } };
    }
    return fail(401, 'UNAUTHORIZED');
  });
  await expect(http.get('/api/business')).rejects.toBeTruthy();
  expect(store.getState().session.tokens).toBeNull();
});

test('logout sends the old tokens and clears locally even offline', async () => {
  signIn();
  const seen: unknown[] = [];
  mockApi(config => {
    seen.push([route(config), config.headers.Authorization, JSON.parse(config.data)]);
    return 'network';
  });
  await store.dispatch(logout());
  expect(seen).toEqual([['POST /api/auth/logout', 'Bearer old', { refreshToken: 'r1' }]]);
  expect(store.getState().session.tokens).toBeNull();
});

test('login falls back to sign-up for a new number', async () => {
  const calls: string[] = [];
  mockApi(config => {
    calls.push(`${route(config)} ${config.data}`);
    return config.url?.includes('/login/')
      ? fail(404, 'ACCOUNT_NOT_FOUND')
      : ok({ channel: 'phone', identifier: '+966512345678', expiresIn: 300, resendAfter: 60 });
  });
  const result = await store
    .dispatch(requestOtp({ channel: 'phone', identifier: '+966512345678' }))
    .unwrap();
  expect(result.mode).toBe('signup');
  expect(calls).toEqual([
    'POST /api/business/auth/login/request-otp {"channel":"phone","identifier":"+966512345678"}',
    'POST /api/business/auth/signup/request-otp {"channel":"phone","identifier":"+966512345678"}',
  ]);
});

test('verifying opens the step the server says comes next, with the forms prefilled', async () => {
  mockApi(config =>
    config.url?.endsWith('/verify-otp')
      ? ok({ ...account('BUSINESS_SETUP', 'SCHEDULE'), accessToken: 'a', refreshToken: 'r', expiresIn: '15m', isNewUser: false })
      : ok(setup()),
  );
  const routes = await store
    .dispatch(verifyOtp({ mode: 'login', channel: 'phone', identifier: '+966512345678', code: '1234' }))
    .unwrap();
  expect(routes.map(item => item.name)).toEqual(['SetupPartner', 'SetupProfile', 'SetupSchedule']);
  expect(store.getState().setup.form.businessName).toBe('Nour Beauty');
  expect(store.getState().session.tokens).toEqual({ accessToken: 'a', refreshToken: 'r' });
});

test('routesFor follows nextAction', () => {
  expect(routesFor(account('BUSINESS_SETUP')).map(item => item.name)).toEqual(['SetupPartner']);
  expect(routesFor(account('BUSINESS_SETUP', 'PAYOUT')).pop()?.name).toBe('SetupPayout');
  expect(routesFor(account('VERIFICATION_STATUS', 'SUBMITTED'))).toEqual([{ name: 'UnderReview' }]);
  expect(routesFor(account('BUSINESS_PORTAL', 'SUBMITTED'))).toEqual([{ name: 'Main' }]);
});

test('a saved session survives a restart, and launch uses it offline', async () => {
  signIn(account('BUSINESS_SETUP', 'SERVICES'));
  await flush();
  mockApi(() => 'network');
  const restarted = createAppStore();
  const routes = await restarted.dispatch(bootstrap()).unwrap();
  expect(routes.pop()?.name).toBe('SetupServices');
  expect(restarted.getState().session.tokens).toEqual(tokens);
});

test('launch signs out when the server rejects the account', async () => {
  signIn();
  await flush();
  mockApi(() => fail(403, 'FORBIDDEN'));
  const restarted = createAppStore();
  expect(await restarted.dispatch(bootstrap()).unwrap()).toEqual([{ name: 'Login' }]);
  expect(restarted.getState().session.tokens).toBeNull();
});

test('forms map to and from the API', () => {
  const form = fromSetup(setup());
  expect(form).toMatchObject({
    partnerTypeId: 'ptype_beauty_services',
    categoryIds: ['c1'],
    team: 'SOLO',
    days: [0],
    timeStart: '09:00',
    breakEnabled: false,
  });
  expect(form).toMatchObject({ phone: '512345678', phoneCountry: 'SA' });
  expect(toProfileInput({ ...form, phone: '0501234567', phoneCountry: 'AE' }, true)).toMatchObject({
    phone: '+971501234567',
  });
  expect(toProfileInput({ ...form, phone: '0512345678' }, true)).toEqual({
    ownerName: 'Noura',
    name: 'Nour Beauty',
    description: null,
    phone: '+966512345678',
    categoryIds: ['c1'],
    city: 'Riyadh',
    district: null,
    street: 'King Fahd Road',
    teamSize: 'SOLO',
    crNumber: '1010123456',
  });
  expect(toSchedule({ ...INITIAL_FORM, days: [0, 6] })).toEqual([
    { dayOfWeek: 0, start: '08:00', end: '22:00', breakStart: '13:00', breakEnd: '14:00' },
    { dayOfWeek: 6, start: '08:00', end: '22:00', breakStart: '13:00', breakEnd: '14:00' },
  ]);
  expect(normalizePhone('+966 51 234 5678')).toBe('+966512345678');
});

test('saving the profile sends a new photo once, then keeps it', async () => {
  signIn();
  store.dispatch(setupLoaded(setup()));
  store.dispatch(formPatched({ logoFileId: 'f9', logoUrl: '/api/files/f9' }));
  const bodies: unknown[] = [];
  mockApi(config => {
    bodies.push(JSON.parse(config.data));
    return ok(setup({ logoUrl: '/api/files/f9' }));
  });
  await store.dispatch(saveProfile()).unwrap();
  await store.dispatch(saveProfile()).unwrap();
  expect(bodies[0]).toMatchObject({ logoFileId: 'f9', crNumber: '1010123456' });
  expect(bodies[1]).not.toHaveProperty('logoFileId');
});

test('uploads are multipart with the purpose before the file', async () => {
  signIn();
  let sent: FormData | undefined;
  mockApi(config => {
    sent = config.data;
    return ok({ fileId: 'f1', url: '/api/files/f1' });
  });
  const file = await store
    .dispatch(uploadFile({ file: { uri: 'file:///a.jpg', type: 'image/jpeg', name: 'a.jpg' }, purpose: 'photo' }))
    .unwrap();
  expect(file).toEqual({ fileId: 'f1', url: '/api/files/f1' });
  // React Native's FormData keeps `_parts`; Node's (used by Jest) has keys().
  const form = sent as unknown as { _parts?: [string, unknown][]; keys?: () => Iterable<string> };
  const names = form._parts ? form._parts.map(([name]) => name) : [...(form.keys?.() ?? [])];
  expect(names).toEqual(['purpose', 'file']);
});

test('profile uploads can go to another host, with the ngrok header and an absolute url', async () => {
  signIn();
  const seen: unknown[] = [];
  mockApi(config => {
    seen.push([config.baseURL, config.url, config.headers['ngrok-skip-browser-warning'], config.headers.Authorization]);
    return ok({ fileId: 'f1', url: '/api/files/f1' });
  });
  const host = 'https://moisture-granola-underwent.ngrok-free.dev';
  const file = await store
    .dispatch(uploadFile({ file: { uri: 'file:///a.jpg', type: 'image/jpeg', name: 'a.jpg' }, purpose: 'photo', baseUrl: host }))
    .unwrap();
  expect(file).toEqual({ fileId: 'f1', url: `${host}/api/files/f1` });
  expect(seen).toEqual([[host, '/api/files', 'true', 'Bearer old']]);
});

test('documents upload to the upload host, then attach on the API', async () => {
  signIn();
  const seen: string[] = [];
  mockApi(config => {
    seen.push(`${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    if (config.url === '/api/files') return ok({ fileId: 'f7', url: '/api/files/f7' });
    if (config.method === 'post') return ok({ id: 'd1', type: 'NATIONAL_ID', fileId: 'f7' }, 201);
    return ok([]);
  });
  await store
    .dispatch(attachDocument({ type: 'NATIONAL_ID', file: { uri: 'file:///id.jpg', type: 'image/jpeg', name: 'id.jpg' } }))
    .unwrap();
  expect(seen).toEqual([
    'POST https://moisture-granola-underwent.ngrok-free.dev/api/files',
    'POST https://lwinoo-staging.techbanq.net/api/business/documents',
    'GET https://lwinoo-staging.techbanq.net/api/business/documents',
  ]);
});

test('an upload host that is down reports an upload failure', async () => {
  signIn();
  mockApi(() => ({ status: 502, data: '<!DOCTYPE html><html>ERR_NGROK_8012</html>' }));
  const action = await store.dispatch(
    uploadFile({ file: { uri: 'file:///a.jpg', type: 'image/jpeg', name: 'a.jpg' }, purpose: 'photo', baseUrl: 'https://x.ngrok-free.dev' }),
  );
  expect(action.payload).toEqual(expect.objectContaining({ code: 'UPLOAD_FAILED', status: 502 }));
});

test('errors map to readable messages', () => {
  const t = ((key: string, params?: Record<string, unknown>) =>
    params ? `${key} ${JSON.stringify(params)}` : key) as never;
  expect(errorMessage(apiError('NETWORK_ERROR', '', 0), t)).toBe('error.network');
  expect(errorMessage(apiError('OTP_INVALID', 'Wrong code. 2 attempts left', 400), t)).toBe(
    'error.otpInvalidLeft {"n":"2"}',
  );
  expect(errorMessage(apiError('OTP_COOLDOWN', '', 429, { retryAfter: 42 }), t)).toBe(
    'error.otpCooldown {"s":42}',
  );
  expect(
    errorMessage(
      apiError('VALIDATION_ERROR', 'Check the form', 400, { fields: { iban: ['IBAN is invalid'] } }),
      t,
    ),
  ).toBe('Check the form\nIBAN is invalid');
  expect(errorMessage(new Error('nope'), t)).toBe('error.generic');
  expect(toApiError(apiError('X', 'boom', 500)).status).toBe(500);
});
