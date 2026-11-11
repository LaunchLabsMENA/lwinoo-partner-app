import { http } from './client';
import type { OtpMethod, PartnerMe, SessionResponse } from './types';

const PATHS = {
  phone: { request: '/api/partner/auth/request-otp', verify: '/api/partner/auth/verify-otp' },
  email: {
    request: '/api/partner/auth/email/request-otp',
    verify: '/api/partner/auth/email/verify-otp',
  },
} as const;

const body = (method: OtpMethod, target: string) =>
  method === 'phone' ? { phone: target } : { email: target };

export const requestOtp = async (method: OtpMethod, target: string) =>
  (await http.post<{ resendAfterSeconds: number }>(PATHS[method].request, body(method, target)))
    .data;

export const verifyOtp = async (method: OtpMethod, target: string, code: string) =>
  (await http.post<SessionResponse>(PATHS[method].verify, { ...body(method, target), code })).data;

export const logout = async (refreshToken: string) => {
  await http.post('/api/auth/logout', { refreshToken }, { timeout: 5000 });
};

export const fetchMe = async () => (await http.get<PartnerMe>('/api/partner/me')).data;
