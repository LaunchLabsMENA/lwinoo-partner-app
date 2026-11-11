import { ImageSourcePropType } from 'react-native';
import type { DocumentType, TeamSize } from '../api/types';
import { TKey } from '../i18n/translations';

/** Shown when a partner type has no image of its own yet. */
export const PARTNER_TYPE_IMAGES: Record<string, ImageSourcePropType> = {
  'fashion-boutique': require('../assets/images/partner-fashion.jpg'),
};
export const DEFAULT_PARTNER_IMAGE: ImageSourcePropType = require('../assets/images/partner-beauty.jpg');

/** The API stores the city's English name; the map opens on it. */
export const CITIES: { name: string; label: TKey; latitude: number; longitude: number }[] = [
  { name: 'Riyadh', label: 'city.riyadh', latitude: 24.7136, longitude: 46.6753 },
  { name: 'Jeddah', label: 'city.jeddah', latitude: 21.5433, longitude: 39.1728 },
  { name: 'Dammam', label: 'city.dammam', latitude: 26.4207, longitude: 50.0888 },
  { name: 'Makkah', label: 'city.makkah', latitude: 21.3891, longitude: 39.8579 },
  { name: 'Madinah', label: 'city.madinah', latitude: 24.5247, longitude: 39.5692 },
];

export const TEAM_SIZES: { value: TeamSize; label: string }[] = [
  { value: 'SOLO', label: '1' },
  { value: 'TWO_TO_FIVE', label: '2-5' },
  { value: 'SIX_TO_TEN', label: '6-10' },
  { value: 'TEN_PLUS', label: '10+' },
];

/** In API order: index = dayOfWeek (0 = Sunday). */
export const DAYS: { id: string; label: TKey }[] = [
  { id: 'sun', label: 'day.sun' },
  { id: 'mon', label: 'day.mon' },
  { id: 'tue', label: 'day.tue' },
  { id: 'wed', label: 'day.wed' },
  { id: 'thu', label: 'day.thu' },
  { id: 'fri', label: 'day.fri' },
  { id: 'sat', label: 'day.sat' },
];

export const RADII = [5, 10, 15, 20, 25];

export const documentLabel = (type: DocumentType): TKey => `doc.${type}` as TKey;

/** Only premises photos can be added more than once (up to 10). */
export const MULTI_DOCUMENTS: DocumentType[] = ['PREMISES_PHOTO'];
export const MAX_MULTI_DOCUMENTS = 10;
