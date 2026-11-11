import type { TKey } from '../i18n/translations';
import { toOnboarding, type SetupForm } from './setup';

export type SetupIssue =
  | { key: 'required'; field: TKey }
  | { key: 'time' }
  | { key: 'documents' };

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
export const REQUIRED_DOCUMENTS = ['id'] as const;

export function validateSetup(form: SetupForm): SetupIssue | null {
  const data = toOnboarding(form);
  if (data.ownerName.length < 2) {
    return { key: 'required', field: 'profile.owner' };
  }
  if (data.businessName.length < 2) {
    return { key: 'required', field: 'profile.business' };
  }
  if (!/^5\d{8}$/.test(data.phone.replace(/^(966|0)/, ''))) {
    return { key: 'required', field: 'profile.phone' };
  }
  if (!data.services.length) {
    return { key: 'required', field: 'profile.services' };
  }
  if (!data.city) {
    return { key: 'required', field: 'profile.city' };
  }
  if (!data.address) {
    return { key: 'required', field: 'profile.address' };
  }
  if (!data.days.length) {
    return { key: 'required', field: 'schedule.title' };
  }
  const times = [
    data.timeStart,
    data.timeEnd,
    ...(data.breakEnabled ? [data.breakStart, data.breakEnd] : []),
  ];
  if (times.some(value => !TIME.test(value))) {
    return { key: 'time' };
  }
  const uploaded = new Set(data.documents.map(document => document.type));
  if (REQUIRED_DOCUMENTS.some(type => !uploaded.has(type))) {
    return { key: 'documents' };
  }
  return null;
}
