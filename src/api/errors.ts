import axios from 'axios';
import type { TKey } from '../i18n/translations';

export type Translate = (key: TKey, params?: Record<string, string | number>) => string;

/** A plain object rather than an Error so it can travel through Redux actions. */
export interface ApiError {
  code: string;
  message: string;
  status: number;
  /** Everything else the server put in `error`, such as `retryAfter` or `fields`. */
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

const fallbackCode = (status: number) =>
  status === 429 ? 'RATE_LIMITED' : status === 401 ? 'UNAUTHORIZED' : 'UNKNOWN';

export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return apiError('NETWORK_ERROR', error.message, 0);
    }
    const { status } = error.response;
    const body = error.response.data as { error?: unknown } | undefined;
    const failure =
      typeof body?.error === 'object' && body.error !== null
        ? (body.error as Record<string, unknown>)
        : {};
    const { code, message, ...details } = failure;
    return apiError(
      typeof code === 'string' ? code : fallbackCode(status),
      typeof message === 'string' ? message : error.message,
      status,
      details,
    );
  }
  if (isApiError(error)) {
    return error;
  }
  return apiError('UNKNOWN', error instanceof Error ? error.message : 'Unknown error', -1);
}

export const LOCKED_CODES = ['BUSINESS_UNDER_REVIEW', 'BUSINESS_LOCKED', 'BUSINESS_SUSPENDED'];

const fieldMessages = (fields: unknown): string[] => {
  if (Array.isArray(fields)) {
    return fields
      .map(item => (typeof item === 'string' ? item : (item as { message?: string })?.message))
      .filter((item): item is string => !!item);
  }
  if (fields && typeof fields === 'object') {
    return Object.values(fields).flat().map(String);
  }
  return [];
};

export function errorMessage(error: unknown, t: Translate): string {
  const failure = toApiError(error);
  const wait = Number(failure.details.retryAfter ?? 60);
  switch (failure.code) {
    case 'NETWORK_ERROR':
      return t('error.network');
    case 'OTP_INVALID': {
      const left = failure.message.match(/\d+/);
      return left && Number(left[0]) > 0
        ? t('error.otpInvalidLeft', { n: left[0] })
        : t('error.otpInvalid');
    }
    case 'OTP_EXPIRED':
    case 'OTP_NOT_FOUND':
      return t('error.otpExpired');
    case 'OTP_ATTEMPTS_EXCEEDED':
    case 'OTP_LOCKED':
      return t('error.otpLocked');
    case 'OTP_LIMIT_REACHED':
      return t('error.otpSendLimit');
    case 'OTP_COOLDOWN':
      return t('error.otpCooldown', { s: wait });
    case 'OTP_DELIVERY_FAILED':
      return t('error.sendFailed');
    case 'INVALID_IDENTIFIER':
      return t('error.invalidIdentifier');
    case 'BUSINESS_ACCOUNT_REQUIRED':
    case 'FORBIDDEN':
      return t('error.businessAccountRequired');
    case 'RATE_LIMITED':
    case 'AUTH_THROTTLED':
      return t('error.rateLimited', { s: wait });
    case 'BUSINESS_UNDER_REVIEW':
      return t('error.underReview');
    case 'BUSINESS_LOCKED':
    case 'BUSINESS_ALREADY_APPROVED':
      return t('error.businessLocked');
    case 'BUSINESS_SUSPENDED':
      return t('error.businessSuspended');
    case 'SERVICE_LIMIT_REACHED':
      return t('error.serviceLimit');
    case 'DOCUMENT_LIMIT_REACHED':
      return t('error.documentLimit');
    case 'FILE_TOO_LARGE':
      return t('error.fileTooLarge');
    case 'FILE_REQUIRED':
    case 'STORAGE_NOT_CONFIGURED':
    case 'UPLOAD_FAILED':
      return t('error.uploadFailed');
    case 'GEOCODER_UNAVAILABLE':
    case 'GEOCODER_BUSY':
      return t('error.geocoder');
    case 'VALIDATION_ERROR':
    case 'BUSINESS_INCOMPLETE':
    case 'DOCUMENT_NOT_REQUIRED': {
      const lines = [failure.message, ...fieldMessages(failure.details.fields)].filter(Boolean);
      return lines.length ? [...new Set(lines)].join('\n') : t('error.generic');
    }
    default:
      return t('error.generic');
  }
}

export const retryAfterSeconds = (error: unknown): number | undefined => {
  const value = toApiError(error).details.retryAfter;
  return typeof value === 'number' ? value : undefined;
};
