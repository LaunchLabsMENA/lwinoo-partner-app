import { http } from './client';
import { apiError } from './errors';
import type { OnboardingData, PartnerMe, UploadPurpose } from './types';

export const saveOnboarding = async (data: Partial<OnboardingData>) =>
  (await http.put<PartnerMe>('/api/partner/onboarding', data)).data;

export const submitOnboarding = async () =>
  (await http.post<PartnerMe>('/api/partner/onboarding/submit')).data;

export async function uploadFile(
  uri: string,
  contentType: string,
  purpose: UploadPurpose,
): Promise<string> {
  const { data } = await http.post<{
    uploadUrl: string;
    publicUrl: string;
    headers: Record<string, string>;
  }>('/api/partner/uploads', { contentType, purpose });

  // The file itself goes straight to storage, outside the API's error format.
  let stored = false;
  try {
    const blob = await (await fetch(uri)).blob();
    stored = (await fetch(data.uploadUrl, { method: 'PUT', headers: data.headers, body: blob })).ok;
  } catch {}
  if (!stored) {
    throw apiError('UPLOAD_FAILED', 'Upload failed', -1);
  }
  return data.publicUrl;
}
