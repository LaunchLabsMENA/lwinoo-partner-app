import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '../config';
import type { Tokens } from './types';

export const http = axios.create({ baseURL: API_BASE_URL, timeout: REQUEST_TIMEOUT_MS });

/** How the client reaches the session; the store connects itself to avoid an import cycle. */
export interface SessionBridge {
  getTokens: () => Tokens | null;
  onRefreshed: (tokens: Tokens) => void;
  onExpired: () => void;
}

let session: SessionBridge | null = null;

export const connectSession = (bridge: SessionBridge) => {
  session = bridge;
};

type Retriable = InternalAxiosRequestConfig & { _retried?: boolean };

let inflight: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const current = session?.getTokens();
  if (!current) {
    throw new Error('No session');
  }
  // This answer is not wrapped in `data`.
  const response = await axios.post<Partial<Tokens> & { data?: Partial<Tokens> }>(
    `${API_BASE_URL}/api/auth/refresh`,
    { refreshToken: current.refreshToken },
    { timeout: REQUEST_TIMEOUT_MS },
  );
  const fresh = response.data.data ?? response.data;
  if (!fresh.accessToken || !fresh.refreshToken) {
    throw new Error('Refresh answered without tokens');
  }
  // The user may have logged out while this was in flight; don't bring the session back.
  if (session?.getTokens()?.refreshToken !== current.refreshToken) {
    throw new Error('Session changed during refresh');
  }
  session.onRefreshed({ accessToken: fresh.accessToken, refreshToken: fresh.refreshToken });
  return fresh.accessToken;
}

// Sign-in calls and the token calls themselves must never trigger a refresh.
const NO_REFRESH = ['/api/auth/refresh', '/api/auth/logout', '/api/business/auth/'];
const skipsRefresh = (url?: string) => !!url && NO_REFRESH.some(path => url.includes(path));

const sessionRejected = (error: unknown) =>
  axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403);

http.interceptors.request.use(config => {
  const token = session?.getTokens()?.accessToken;
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  response => {
    // Successful answers are `{ success: true, data }`; callers only want `data`.
    const body = response.data as { success?: boolean; data?: unknown } | undefined;
    if (body && typeof body === 'object' && body.success === true && 'data' in body) {
      response.data = body.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    const original = error.config as Retriable | undefined;
    if (
      error.response?.status !== 401 ||
      !original ||
      original._retried ||
      skipsRefresh(original.url) ||
      !session?.getTokens()
    ) {
      throw error;
    }
    original._retried = true;
    try {
      inflight ??= refreshAccessToken().finally(() => {
        inflight = null;
      });
      const token = await inflight;
      original.headers.Authorization = `Bearer ${token}`;
      return await http(original);
    } catch (refreshError) {
      // A failed connection keeps the session; only the server rejecting it ends it.
      if (sessionRejected(refreshError)) {
        session?.onExpired();
      }
      throw refreshError;
    }
  },
);
