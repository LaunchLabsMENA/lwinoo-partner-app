import { ImageSourcePropType } from 'react-native';
import { TKey } from '../i18n/translations';

export const PARTNER_AVATAR: ImageSourcePropType = require('../assets/images/partner-beauty.jpg');

export const UNREAD_NOTIFICATIONS = 2;

export const OVERVIEW_STATS: {
  id: string;
  label: TKey;
  value: string;
  caption?: TKey;
  captionCount?: number;
}[] = [
  { id: 'earnings', label: 'overview.earnings', value: '1,480', caption: 'overview.sar' },
  {
    id: 'bookings',
    label: 'overview.bookingsToday',
    value: '3',
    caption: 'overview.pendingCaption',
    captionCount: 2,
  },
  {
    id: 'rating',
    label: 'overview.rating',
    value: '4.9',
    caption: 'overview.reviews',
    captionCount: 128,
  },
  { id: 'pending', label: 'overview.pending', value: '2' },
];

export type BookingFilter = 'all' | 'home' | 'salon';

export const BOOKING_FILTERS: { id: BookingFilter; label: TKey }[] = [
  { id: 'all', label: 'bookings.filterAll' },
  { id: 'home', label: 'bookings.filterHome' },
  { id: 'salon', label: 'bookings.filterSalon' },
];

export interface Booking {
  id: string;
  client: string;
  service: TKey;
  date: string;
  time: string;
  price: number;
  location: 'home' | 'salon';
  status: 'pending' | 'upcoming';
}

export const BOOKINGS: Booking[] = [
  {
    id: 'amina',
    client: 'Amina Qurban',
    service: 'bookings.bridalHair',
    date: 'Sat, 14 Sep 2026',
    time: '3:00 PM',
    price: 650,
    location: 'home',
    status: 'pending',
  },
  {
    id: 'layan',
    client: 'Layan M.',
    service: 'bookings.hairColor',
    date: 'Sat, 14 Sep 2026',
    time: '3:00 PM',
    price: 650,
    location: 'salon',
    status: 'pending',
  },
  {
    id: 'sara',
    client: 'Sara K.',
    service: 'bookings.hairColor',
    date: 'Sat, 14 Sep 2026',
    time: '3:00 PM',
    price: 650,
    location: 'home',
    status: 'upcoming',
  },
];

export const MONTHS: TKey[] = [
  'month.jan',
  'month.feb',
  'month.mar',
  'month.apr',
  'month.may',
  'month.jun',
  'month.jul',
  'month.aug',
  'month.sep',
  'month.oct',
  'month.nov',
  'month.dec',
];

export const CALENDAR_START = {
  month: new Date(2025, 7, 1),
  rangeStart: new Date(2025, 7, 7).getTime(),
  rangeEnd: new Date(2025, 7, 12).getTime(),
};

export const SCHEDULE_DAY = { label: 'Sep 14, 2026', bookings: 9, utilisation: 50 };

export interface CalendarSlot {
  time: string;
  status: 'booked' | 'ongoing' | 'available' | 'blocked';
  client?: string;
  detail?: TKey;
}

export const CALENDAR_SLOTS: CalendarSlot[] = [
  { time: '9:00 AM', status: 'booked', client: 'Fatima A.', detail: 'bookings.hairColor' },
  { time: '9:30 AM', status: 'booked', client: 'Fatima A.', detail: 'calendar.cont' },
  { time: '10:00 AM', status: 'booked', client: 'Layan M.', detail: 'bookings.blowdry' },
  { time: '10:30 AM', status: 'available' },
  { time: '11:00 AM', status: 'available' },
  { time: '11:30 AM', status: 'ongoing', client: 'Sara K.', detail: 'bookings.bridalMakeup' },
  { time: '2:00 PM', status: 'available' },
  { time: '3:30 PM', status: 'blocked' },
  { time: '4:30 PM', status: 'available' },
];
