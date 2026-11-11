import axios from 'axios';
import { hostHeaders, UPLOAD_TIMEOUT_MS } from '../config';
import { http } from './client';
import { apiError } from './errors';
import type {
  BusinessDocument,
  BusinessSetup,
  DocumentType,
  PayoutInput,
  ProfileInput,
  ScheduleDay,
  Service,
  ServiceAreaInput,
  ServiceInput,
  UploadedFile,
  UploadPurpose,
} from './types';

export const fetchBusiness = async () => (await http.get<BusinessSetup>('/api/business')).data;

export const saveType = async (partnerTypeId: string) =>
  (await http.put<BusinessSetup>('/api/business/type', { partnerTypeId })).data;

export const saveProfile = async (input: ProfileInput) =>
  (await http.put<BusinessSetup>('/api/business/profile', input)).data;

export const saveSchedule = async (days: ScheduleDay[]) =>
  (await http.put<BusinessSetup>('/api/business/schedule', { days })).data;

export const saveServiceArea = async (input: ServiceAreaInput) =>
  (await http.put<BusinessSetup>('/api/business/service-area', input)).data;

export const savePayout = async (input: PayoutInput) =>
  (await http.put<BusinessSetup>('/api/business/payout', input)).data;

export const submitBusiness = async () =>
  (await http.post<BusinessSetup>('/api/business/submit', {})).data;

export const fetchServices = async () =>
  (await http.get<Service[]>('/api/business/services')).data;

export const createService = async (input: ServiceInput) =>
  (await http.post<Service>('/api/business/services', input)).data;

export const updateService = async (id: string, input: ServiceInput) =>
  (await http.patch<Service>(`/api/business/services/${id}`, input)).data;

export const deleteService = async (id: string) => {
  await http.delete(`/api/business/services/${id}`);
};

export const fetchDocuments = async () =>
  (await http.get<BusinessDocument[]>('/api/business/documents')).data;

export const addDocument = async (type: DocumentType, fileId: string) =>
  (await http.post<BusinessDocument>('/api/business/documents', { type, fileId })).data;

export const deleteDocument = async (id: string) => {
  await http.delete(`/api/business/documents/${id}`);
};

export interface LocalFile {
  uri: string;
  type: string;
  name: string;
}

/**
 * Uploads to the API, or to `baseUrl` when given; the answer's `url` is then made absolute
 * so the preview loads from the same host.
 */
export async function uploadFile(
  file: LocalFile,
  purpose: UploadPurpose,
  baseUrl?: string,
): Promise<UploadedFile> {
  const form = new FormData();
  // `purpose` goes first so the server knows the rules before it reads the file.
  form.append('purpose', purpose);
  form.append('file', file as unknown as Blob);
  try {
    const { data } = await http.post<UploadedFile>('/api/files', form, {
      ...(baseUrl ? { baseURL: baseUrl } : {}),
      headers: { 'Content-Type': 'multipart/form-data', ...hostHeaders(baseUrl) },
      timeout: UPLOAD_TIMEOUT_MS,
    });
    return baseUrl && data.url.startsWith('/') ? { ...data, url: `${baseUrl}${data.url}` } : data;
  } catch (error) {
    // A host that is down answers with an HTML page, not the API's error format.
    const body = axios.isAxiosError(error) ? error.response?.data : undefined;
    if (axios.isAxiosError(error) && error.response && !(body as { error?: unknown })?.error) {
      throw apiError('UPLOAD_FAILED', `Upload failed (${error.response.status})`, error.response.status);
    }
    throw error;
  }
}
