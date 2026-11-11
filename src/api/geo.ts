import { http } from './client';
import type { Place } from './types';

export const searchPlaces = async (q: string, lang: 'en' | 'ar') =>
  (await http.get<Place[]>('/api/geo/search', { params: { q, lang } })).data;

export const reversePlace = async (lat: number, lng: number, lang: 'en' | 'ar') =>
  (await http.get<Place | null>('/api/geo/reverse', { params: { lat, lng, lang } })).data;
