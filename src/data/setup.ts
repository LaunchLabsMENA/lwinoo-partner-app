import { ImageSourcePropType } from 'react-native';
import type { DocumentType } from '../api/types';
import { TKey } from '../i18n/translations';

export const PARTNER_TYPES: {
  id: 'beauty' | 'fashion';
  title: TKey;
  subtitle: TKey;
  image: ImageSourcePropType;
}[] = [
  {
    id: 'beauty',
    title: 'partner.beauty',
    subtitle: 'partner.beautySub',
    image: require('../assets/images/partner-beauty.jpg'),
  },
  {
    id: 'fashion',
    title: 'partner.fashion',
    subtitle: 'partner.fashionSub',
    image: require('../assets/images/partner-fashion.jpg'),
  },
];

export const SERVICE_CATEGORIES: { id: string; label: TKey }[] = [
  { id: 'salon', label: 'profile.salon' },
  { id: 'makeup', label: 'profile.makeup' },
  { id: 'nails', label: 'profile.nails' },
  { id: 'spa', label: 'profile.spa' },
  { id: 'home', label: 'profile.home' },
];

export const CITIES: { id: string; label: TKey }[] = [
  { id: 'riyadh', label: 'city.riyadh' },
  { id: 'jeddah', label: 'city.jeddah' },
  { id: 'dammam', label: 'city.dammam' },
  { id: 'makkah', label: 'city.makkah' },
  { id: 'madinah', label: 'city.madinah' },
];

export const ADDRESSES: { id: string; label: TKey }[] = [
  { id: 'olaya', label: 'address.olaya' },
  { id: 'malqa', label: 'address.malqa' },
  { id: 'nakheel', label: 'address.nakheel' },
  { id: 'yasmin', label: 'address.yasmin' },
];

export const TEAM_SIZES = ['1', '2-5', '6-10', '10+'];

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

export const MY_SERVICES: {
  id: string;
  title: TKey;
  subtitle: TKey;
  image: ImageSourcePropType;
}[] = [
  {
    id: 'facial',
    title: 'services.facial',
    subtitle: 'services.facialSub',
    image: require('../assets/images/service-facial.jpg'),
  },
  {
    id: 'manicure',
    title: 'services.manicure',
    subtitle: 'services.manicureSub',
    image: require('../assets/images/service-manicure.jpg'),
  },
];

export const DOCUMENTS: { id: DocumentType; label: TKey }[] = [
  { id: 'cr', label: 'documents.cr' },
  { id: 'id', label: 'documents.id' },
  { id: 'license', label: 'documents.license' },
  { id: 'photos', label: 'documents.photos' },
];
