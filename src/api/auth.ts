import { http } from './client';
import type { Account, AuthMode, AuthResponse, Channel, OtpSent, Tokens } from './types';

const AUTH = '/api/business/auth';

export const requestOtp = async (mode: AuthMode, channel: Channel, identifier: string) =>
  (await http.post<OtpSent>(`${AUTH}/${mode}/request-otp`, { channel, identifier })).data;

export const verifyOtp = async (
  mode: AuthMode,
  channel: Channel,
  identifier: string,
  code: string,
) => (await http.post<AuthResponse>(`${AUTH}/${mode}/verify-otp`, { channel, identifier, code })).data;

export const fetchMe = async () => (await http.get<Account>('/api/auth/me')).data;

/** Sends the tokens explicitly because the session is cleared locally before this runs. */
export const logout = async ({ accessToken, refreshToken }: Tokens) => {
  await http.post(
    '/api/auth/logout',
    { refreshToken },
    { headers: { Authorization: `Bearer ${accessToken}` }, timeout: 5000 },
  );
};
