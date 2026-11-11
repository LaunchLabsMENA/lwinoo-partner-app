import { createAsyncThunk, type GetThunkAPI } from '@reduxjs/toolkit';
import * as authApi from '../api/auth';
import { toApiError, type ApiError } from '../api/errors';
import * as partnerApi from '../api/partner';
import type { OtpMethod, PartnerMe, UploadPurpose } from '../api/types';
import { BOOT_TIMEOUT_MS } from '../config';
import { routeFor, type SessionRoute } from '../navigation/route-for';
import { draftResult, formLoaded, toOnboarding } from '../state/setup';
import { meReceived, sessionCleared, sessionRestored, sessionStarted } from './session';
import { readSession } from './session-storage';
import type { RootState } from './types';

type ThunkConfig = { state: RootState; rejectValue: ApiError };

const createAppThunk = createAsyncThunk.withTypes<ThunkConfig>();

/** Every API thunk rejects with the same serializable ApiError. */
const apiThunk = <Result, Arg = void>(
  type: string,
  run: (arg: Arg, api: GetThunkAPI<ThunkConfig>) => Promise<Result>,
) =>
  createAppThunk<Result, Arg>(type, async (arg, api) => {
    try {
      return await run(arg, api);
    } catch (error) {
      return api.rejectWithValue(toApiError(error));
    }
  });

export const requestOtp = apiThunk(
  'session/requestOtp',
  ({ method, target }: { method: OtpMethod; target: string }) =>
    authApi.requestOtp(method, target),
);

export const verifyOtp = apiThunk(
  'session/verifyOtp',
  async (
    { method, target, code }: { method: OtpMethod; target: string; code: string },
    { dispatch },
  ) => {
    const session = await authApi.verifyOtp(method, target, code);
    const { accessToken, refreshToken, user } = session;
    dispatch(sessionStarted({ tokens: { accessToken, refreshToken }, me: user }));
    return session;
  },
);

export const logout = createAppThunk('session/logout', async (_: void, { dispatch, getState }) => {
  const refreshToken = getState().session.tokens?.refreshToken;
  dispatch(sessionCleared());
  if (refreshToken) {
    // Leaving the app must work offline; the server token simply expires on its own.
    await authApi.logout(refreshToken).catch(() => {});
  }
});

export const saveDraft = createAppThunk('setup/saveDraft', async (_: void, api) => {
  try {
    const me = await partnerApi.saveOnboarding(toOnboarding(api.getState().setup.form));
    api.dispatch(meReceived(me));
    api.dispatch(draftResult({ failed: false }));
  } catch {
    api.dispatch(draftResult({ failed: true }));
  }
});

export const submitApplication = apiThunk(
  'setup/submit',
  async (_: void, { dispatch, getState }) => {
    await partnerApi.saveOnboarding(toOnboarding(getState().setup.form));
    const me = await partnerApi.submitOnboarding();
    dispatch(meReceived(me));
    return me;
  },
);

export const uploadPicture = apiThunk(
  'setup/upload',
  ({ uri, type, purpose }: { uri: string; type: string; purpose: UploadPurpose }) =>
    partnerApi.uploadFile(uri, type, purpose),
);

export type BootRoute = SessionRoute | 'Login';

type FreshAccount = { me: PartnerMe } | { error: ApiError } | 'timeout';

/** Restores the saved session on launch and decides which screen comes after the splash. */
export const bootstrap = createAppThunk(
  'session/bootstrap',
  async (_: void, { dispatch, getState }): Promise<BootRoute> => {
    const saved = await readSession();
    dispatch(sessionRestored(saved));
    if (!saved) {
      return 'Login';
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    const result = await Promise.race<FreshAccount>([
      authApi.fetchMe().then(
        me => {
          dispatch(meReceived(me));
          return { me };
        },
        error => ({ error: toApiError(error) }),
      ),
      new Promise(resolve => {
        timer = setTimeout(() => resolve('timeout'), BOOT_TIMEOUT_MS);
      }),
    ]);
    clearTimeout(timer);

    if (result !== 'timeout' && 'me' in result) {
      dispatch(formLoaded(result.me.onboarding));
      return routeFor(result.me);
    }
    const status = result === 'timeout' ? 0 : result.error.status;
    if (status === 401 || status === 403) {
      dispatch(sessionCleared());
      return 'Login';
    }
    const cached = getState().session.me;
    if (cached) {
      dispatch(formLoaded(cached.onboarding));
      return routeFor(cached);
    }
    return 'Login';
  },
);
