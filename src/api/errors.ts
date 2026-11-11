import axios from 'axios';
import type { TKey } from '../i18n/translations';

export type Translate = (key: TKey, params?: Record<string, string | number>) => string;

/** A plain object rather than an Error so it can travel through Redux actions. */
export interface ApiError {
  code: string;
  message: string;
  status: number;
  details: Record<string, unknown>;
}

export const apiError = (
  code: string,
  message: string,
  status: number,
  details: Record<string, unknown> = {},
): ApiError => ({ code, message, status, details });

const isApiError = (value: unknown): value is ApiError =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as ApiError).code === 'string' &&
  typeof (value as ApiError).status === 'number' &&
  typeof (value as ApiError).details === 'object';

export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return apiError('NETWORK_ERROR', error.message, 0);
    }
    const { status } = error.response;
    const body = error.response.data as { error?: unknown } | undefined;
    const failure =
      typeof body?.error === 'object' && body.error !== null
        ? (body.error as { code?: string; message?: string; details?: Record<string, unknown> })
        : undefined;
    return apiError(
      failure?.code ?? (status === 429 ? 'RATE_LIMITED' : 'UNKNOWN'),
      failure?.message ?? error.message,
      status,
      failure?.details ?? {},
    );
  }
  if (isApiError(error)) {
    return error;
  }
  return apiError('UNKNOWN', error instanceof Error ? error.message : 'Unknown error', -1);
}

export function errorMessage(error: unknown, t: Translate): string {
  const failure = toApiError(error);
  switch (failure.code) {
    case 'NETWORK_ERROR':
      return t('error.network');
    case 'OTP_INVALID': {
      const left = failure.details.attemptsLeft;
      return typeof left === 'number' && left > 0
        ? t('error.otpInvalidLeft', { n: left })
        : t('error.otpInvalid');
    }
    case 'OTP_LOCKED':
      return t('error.otpLocked');
    case 'OTP_SEND_LIMIT':
      return t('error.otpSendLimit');
    case 'OTP_RESEND_COOLDOWN':
      return t('error.otpCooldown', { s: Number(failure.details.retryAfterSeconds ?? 60) });
    case 'ROLE_MISMATCH':
      return t('error.roleMismatch');
    case 'ACCOUNT_BLOCKED':
      return t('error.accountBlocked');
    case 'ACCOUNT_SUSPENDED':
      return t('error.accountSuspended');
    case 'RATE_LIMITED':
      return t('error.rateLimited');
    case 'SMS_SEND_FAILED':
    case 'EMAIL_SEND_FAILED':
    case 'SMS_NOT_CONFIGURED':
    case 'EMAIL_NOT_CONFIGURED':
      return t('error.sendFailed');
    case 'STORAGE_NOT_CONFIGURED':
    case 'UPLOAD_FAILED':
      return t('error.uploadFailed');
    case 'ONBOARDING_LOCKED':
      return t('error.onboardingLocked');
    case 'ONBOARDING_INCOMPLETE':
    case 'VALIDATION_ERROR':
      return failure.message || t('error.generic');
    default:
      return t('error.generic');
  }
}

export const retryAfterSeconds = (error: unknown): number | undefined => {
  const value = toApiError(error).details.retryAfterSeconds;
  return typeof value === 'number' ? value : undefined;
};
