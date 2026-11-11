import { createAsyncThunk, type GetThunkAPI } from '@reduxjs/toolkit';
import * as authApi from '../api/auth';
import * as businessApi from '../api/business';
import * as catalogApi from '../api/catalog';
import { toApiError, type ApiError } from '../api/errors';
import type {
  Account,
  AuthMode,
  BusinessSetup,
  Channel,
  DocumentType,
  PayoutInput,
  ServiceAreaInput,
  ServiceInput,
  UploadPurpose,
} from '../api/types';
import { BOOT_TIMEOUT_MS, UPLOAD_BASE_URL } from '../config';
import { routesFor, type Route } from '../navigation/route-for';
import {
  catalogReceived,
  documentsReceived,
  serviceRemoved,
  serviceSaved,
  servicesReceived,
  setupLoaded,
  setupSaved,
  toProfileInput,
  toSchedule,
} from '../state/setup';
import {
  accountReceived,
  businessSummaryChanged,
  sessionCleared,
  sessionRestored,
  sessionStarted,
} from './session';
import { readSession } from './session-storage';
import type { RootState } from './types';

type ThunkConfig = { state: RootState; rejectValue: ApiError };
type Api = GetThunkAPI<ThunkConfig>;

const createAppThunk = createAsyncThunk.withTypes<ThunkConfig>();

/** Every API thunk rejects with the same serializable ApiError. */
const apiThunk = <Result, Arg = void>(type: string, run: (arg: Arg, api: Api) => Promise<Result>) =>
  createAppThunk<Result, Arg>(type, async (arg, api) => {
    try {
      return await run(arg, api);
    } catch (error) {
      return api.rejectWithValue(toApiError(error));
    }
  });

/* ---------- Sign-in ---------- */

/** One screen serves both: log in, and if the number is new, sign up instead. */
export const requestOtp = apiThunk(
  'auth/requestOtp',
  async ({ channel, identifier, mode }: { channel: Channel; identifier: string; mode?: AuthMode }) => {
    if (mode) {
      return { mode, sent: await authApi.requestOtp(mode, channel, identifier) };
    }
    try {
      return { mode: 'login' as const, sent: await authApi.requestOtp('login', channel, identifier) };
    } catch (error) {
      if (toApiError(error).code !== 'ACCOUNT_NOT_FOUND') {
        throw error;
      }
      return { mode: 'signup' as const, sent: await authApi.requestOtp('signup', channel, identifier) };
    }
  },
);

export const verifyOtp = apiThunk(
  'auth/verifyOtp',
  async (
    arg: { mode: AuthMode; channel: Channel; identifier: string; code: string },
    { dispatch },
  ) => {
    const answer = await authApi.verifyOtp(arg.mode, arg.channel, arg.identifier, arg.code);
    const account: Account = {
      user: answer.user,
      business: answer.business,
      nextAction: answer.nextAction,
    };
    dispatch(
      sessionStarted({
        tokens: { accessToken: answer.accessToken, refreshToken: answer.refreshToken },
        account,
      }),
    );
    if (account.business) {
      // Prefill the forms; the routing doesn't depend on it.
      await dispatch(loadBusiness());
    }
    return routesFor(account);
  },
);

export const logout = createAppThunk('auth/logout', async (_: void, { dispatch, getState }) => {
  const tokens = getState().session.tokens;
  dispatch(sessionCleared());
  if (tokens) {
    // Leaving the app must work offline; the server token simply expires on its own.
    await authApi.logout(tokens).catch(() => {});
  }
});

type Fresh = { account: Account } | { error: ApiError } | 'timeout';

/** Restores the saved session on launch and decides which screens come after the splash. */
export const bootstrap = createAppThunk(
  'auth/bootstrap',
  async (_: void, { dispatch, getState }): Promise<Route[]> => {
    const saved = await readSession();
    dispatch(sessionRestored(saved));
    dispatch(loadCatalog());
    if (!saved) {
      return [{ name: 'Login' }];
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    const result = await Promise.race<Fresh>([
      authApi.fetchMe().then(
        account => ({ account }),
        error => ({ error: toApiError(error) }),
      ),
      new Promise(resolve => {
        timer = setTimeout(() => resolve('timeout'), BOOT_TIMEOUT_MS);
      }),
    ]);
    clearTimeout(timer);

    if (result !== 'timeout' && 'account' in result) {
      dispatch(accountReceived(result.account));
      if (result.account.business) {
        await dispatch(loadBusiness());
      }
      return routesFor(result.account);
    }
    const status = result === 'timeout' ? 0 : result.error.status;
    if (status === 401 || status === 403) {
      dispatch(sessionCleared());
      return [{ name: 'Login' }];
    }
    const cached = getState().session.account;
    return cached ? routesFor(cached) : [{ name: 'Login' }];
  },
);

/* ---------- Catalog and saved data ---------- */

export const loadCatalog = apiThunk('catalog/load', async (_: void, { dispatch, getState }) => {
  const { partnerTypes, categories } = getState().setup;
  if (partnerTypes.length && categories.length) {
    return;
  }
  const [types, cats] = await Promise.all([
    catalogApi.fetchPartnerTypes(),
    catalogApi.fetchCategories(),
  ]);
  dispatch(catalogReceived({ partnerTypes: types, categories: cats }));
});

const summaryOf = (setup: BusinessSetup) =>
  setup.business && {
    id: setup.business.id,
    status: setup.business.status,
    setupStep: setup.business.setupStep,
    name: setup.business.name,
    rejectionReason: setup.business.rejectionReason,
  };

export const loadBusiness = apiThunk('business/load', async (_: void, { dispatch }) => {
  const setup = await businessApi.fetchBusiness();
  dispatch(setupLoaded(setup));
  const business = summaryOf(setup);
  if (business) {
    dispatch(businessSummaryChanged({ business }));
  }
  return setup;
});

const saveStep = (type: string, save: (api: Api) => Promise<BusinessSetup>) =>
  apiThunk(type, async (_: void, api) => {
    const setup = await save(api);
    api.dispatch(setupSaved(setup));
    const business = summaryOf(setup);
    if (business) {
      api.dispatch(businessSummaryChanged({ business }));
    }
    return setup;
  });

export const savePartnerType = apiThunk(
  'business/type',
  async (partnerTypeId: string, { dispatch }) => {
    const setup = await businessApi.saveType(partnerTypeId);
    dispatch(setupSaved(setup));
    const business = summaryOf(setup);
    if (business) {
      dispatch(businessSummaryChanged({ business }));
    }
    return setup;
  },
);

export const saveProfile = saveStep('business/profile', ({ getState }) => {
  const { form, partnerTypes, setup } = getState().setup;
  const type =
    partnerTypes.find(item => item.id === form.partnerTypeId) ?? setup?.business?.partnerType;
  const needsCr = !!type?.requiredDocuments.includes('COMMERCIAL_REGISTRATION');
  return businessApi.saveProfile(toProfileInput(form, needsCr));
});

export const saveSchedule = saveStep('business/schedule', ({ getState }) =>
  businessApi.saveSchedule(toSchedule(getState().setup.form)),
);

export const saveServiceArea = apiThunk(
  'business/serviceArea',
  async (input: ServiceAreaInput, { dispatch }) => {
    const setup = await businessApi.saveServiceArea(input);
    dispatch(setupSaved(setup));
    return setup;
  },
);

export const savePayout = apiThunk('business/payout', async (input: PayoutInput, { dispatch }) => {
  const setup = await businessApi.savePayout(input);
  dispatch(setupSaved(setup));
  return setup;
});

export const submitApplication = saveStep('business/submit', () => businessApi.submitBusiness());

/* ---------- Services ---------- */

export const loadServices = apiThunk('services/load', async (_: void, { dispatch }) => {
  dispatch(servicesReceived(await businessApi.fetchServices()));
});

export const saveService = apiThunk(
  'services/save',
  async ({ id, input }: { id?: string; input: ServiceInput }, { dispatch }) => {
    const service = id
      ? await businessApi.updateService(id, input)
      : await businessApi.createService(input);
    dispatch(serviceSaved(service));
    return service;
  },
);

export const removeService = apiThunk('services/remove', async (id: string, { dispatch }) => {
  await businessApi.deleteService(id);
  dispatch(serviceRemoved(id));
});

/* ---------- Files and documents ---------- */

export const uploadFile = apiThunk(
  'files/upload',
  ({
    file,
    purpose,
    baseUrl,
  }: {
    file: businessApi.LocalFile;
    purpose: UploadPurpose;
    baseUrl?: string;
  }) => businessApi.uploadFile(file, purpose, baseUrl),
);

export const attachDocument = apiThunk(
  'documents/attach',
  async ({ type, file }: { type: DocumentType; file: businessApi.LocalFile }, { dispatch }) => {
    const uploaded = await businessApi.uploadFile(file, 'document', UPLOAD_BASE_URL);
    await businessApi.addDocument(type, uploaded.fileId);
    dispatch(documentsReceived(await businessApi.fetchDocuments()));
  },
);

export const removeDocuments = apiThunk('documents/remove', async (ids: string[], { dispatch }) => {
  try {
    for (const id of ids) {
      await businessApi.deleteDocument(id);
    }
  } finally {
    dispatch(documentsReceived(await businessApi.fetchDocuments().catch(() => [])));
  }
});
