import { useMemo } from 'react';
import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { COUNTRIES, DEFAULT_COUNTRY } from '../data/countries';
import { toE164 } from '../utils/phone';
import type {
  BusinessDocument,
  BusinessSetup,
  Category,
  PartnerType,
  ProfileInput,
  ScheduleDay,
  Service,
  ServiceLocation,
  TeamSize,
} from '../api/types';

export interface SetupForm {
  partnerTypeId: string | null;
  /** Left undefined, the server keeps the current photo. */
  logoFileId?: string | null;
  logoUrl: string | null;
  coverFileId?: string | null;
  coverUrl: string | null;
  ownerName: string;
  businessName: string;
  description: string;
  phone: string;
  /** The country picked for the business phone. */
  phoneCountry: CountryCode;
  categoryIds: string[];
  city: string | null;
  district: string;
  street: string;
  team: TeamSize;
  crNumber: string;
  /** 0 = Sunday ... 6 = Saturday, as the API expects. */
  days: number[];
  timeStart: string;
  timeEnd: string;
  breakEnabled: boolean;
  breakStart: string;
  breakEnd: string;
  area: ServiceLocation;
  radius: number;
  latitude: number | null;
  longitude: number | null;
  bankName: string;
  iban: string;
  acceptedTerms: boolean;
}

export const INITIAL_FORM: SetupForm = {
  partnerTypeId: null,
  logoUrl: null,
  coverUrl: null,
  ownerName: '',
  businessName: '',
  description: '',
  phone: '',
  phoneCountry: 'SA',
  categoryIds: [],
  city: null,
  district: '',
  street: '',
  team: 'SIX_TO_TEN',
  crNumber: '',
  days: [1, 2, 3, 4],
  timeStart: '08:00',
  timeEnd: '22:00',
  breakEnabled: true,
  breakStart: '13:00',
  breakEnd: '14:00',
  area: 'TRAVELS_TO_CLIENT',
  radius: 15,
  latitude: null,
  longitude: null,
  bankName: '',
  iban: '',
  acceptedTerms: false,
};

/** Splits a saved number (+9665…) into the country and the local part shown in the field. */
const splitPhone = (phone: string | null): { phone: string; phoneCountry: CountryCode } => {
  const parsed = phone ? parsePhoneNumberFromString(phone, 'SA') : undefined;
  return parsed?.country
    ? { phone: parsed.nationalNumber, phoneCountry: parsed.country }
    : { phone: phone ?? '', phoneCountry: 'SA' };
};

/** Prefills every form from what the server has saved. */
export const fromSetup = (setup: BusinessSetup | null): SetupForm => {
  const business = setup?.business;
  if (!business) {
    return INITIAL_FORM;
  }
  const schedule = setup.schedule ?? [];
  const first = schedule[0];
  return {
    ...INITIAL_FORM,
    partnerTypeId: business.partnerType?.id ?? null,
    logoUrl: business.logoUrl,
    coverUrl: business.coverUrl,
    ownerName: business.ownerName ?? '',
    businessName: business.name ?? '',
    description: business.description ?? '',
    ...splitPhone(business.phone),
    categoryIds: (business.categories ?? []).map(item =>
      typeof item === 'string' ? item : item.id,
    ),
    city: business.city,
    district: business.district ?? '',
    street: business.street ?? '',
    team: business.teamSize ?? INITIAL_FORM.team,
    crNumber: business.crNumber ?? '',
    ...(first
      ? {
          days: schedule.map(day => day.dayOfWeek).sort(),
          timeStart: first.start,
          timeEnd: first.end,
          breakEnabled: !!first.breakStart,
          breakStart: first.breakStart ?? INITIAL_FORM.breakStart,
          breakEnd: first.breakEnd ?? INITIAL_FORM.breakEnd,
        }
      : {}),
    area: business.serviceLocation ?? INITIAL_FORM.area,
    radius: business.serviceRadiusKm ?? INITIAL_FORM.radius,
    latitude: business.latitude,
    longitude: business.longitude,
    bankName: business.bankName ?? '',
    acceptedTerms: !!business.termsAcceptedAt,
  };
};

/** The business phone in international form, or as typed if it can't be read as a number. */
export const businessPhone = (form: Pick<SetupForm, 'phone' | 'phoneCountry'>): string => {
  const country = COUNTRIES.find(item => item.iso === form.phoneCountry) ?? DEFAULT_COUNTRY;
  return toE164(form.phone, country) ?? normalizePhone(form.phone);
};

/** The API takes 05XXXXXXXX or +9665XXXXXXXX. */
export const normalizePhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');
  if (/^5\d{8}$/.test(digits)) {
    return `0${digits}`;
  }
  if (/^9665\d{8}$/.test(digits)) {
    return `+${digits}`;
  }
  return raw.trim();
};

export const toProfileInput = (form: SetupForm, needsCr: boolean): ProfileInput => ({
  ...(form.logoFileId !== undefined ? { logoFileId: form.logoFileId } : {}),
  ...(form.coverFileId !== undefined ? { coverFileId: form.coverFileId } : {}),
  ownerName: form.ownerName.trim(),
  name: form.businessName.trim(),
  description: form.description.trim() || null,
  phone: businessPhone(form),
  categoryIds: form.categoryIds,
  city: form.city ?? '',
  district: form.district.trim() || null,
  street: form.street.trim(),
  teamSize: form.team,
  ...(needsCr || form.crNumber.trim() ? { crNumber: form.crNumber.trim() } : {}),
});

/** The screen has one set of hours, sent for every selected day. */
export const toSchedule = (form: SetupForm): ScheduleDay[] =>
  form.days.map(dayOfWeek => ({
    dayOfWeek,
    start: form.timeStart,
    end: form.timeEnd,
    breakStart: form.breakEnabled ? form.breakStart : null,
    breakEnd: form.breakEnabled ? form.breakEnd : null,
  }));

export interface SetupState {
  form: SetupForm;
  setup: BusinessSetup | null;
  partnerTypes: PartnerType[];
  categories: Category[];
}

const initialState: SetupState = {
  form: INITIAL_FORM,
  setup: null,
  partnerTypes: [],
  categories: [],
};

const setupSlice = createSlice({
  name: 'setup',
  initialState,
  reducers: {
    formPatched: (state, action: PayloadAction<Partial<SetupForm>>) => {
      Object.assign(state.form, action.payload);
    },
    /** Server data opened fresh: replace both the record and the forms. */
    setupLoaded: (state, action: PayloadAction<BusinessSetup>) => {
      state.setup = action.payload;
      state.form = fromSetup(action.payload);
    },
    /** A step was saved: keep what the person is typing, refresh the record. */
    setupSaved: (state, action: PayloadAction<BusinessSetup>) => {
      state.setup = action.payload;
      const business = action.payload.business;
      if (business) {
        state.form.partnerTypeId = business.partnerType?.id ?? state.form.partnerTypeId;
        state.form.logoUrl = business.logoUrl;
        state.form.coverUrl = business.coverUrl;
        delete state.form.logoFileId;
        delete state.form.coverFileId;
      }
    },
    servicesReceived: (state, action: PayloadAction<Service[]>) => {
      if (state.setup) {
        state.setup.services = action.payload;
      }
    },
    serviceSaved: (state, action: PayloadAction<Service>) => {
      if (!state.setup) {
        return;
      }
      const index = state.setup.services.findIndex(item => item.id === action.payload.id);
      if (index >= 0) {
        state.setup.services[index] = action.payload;
      } else {
        state.setup.services.push(action.payload);
      }
    },
    serviceRemoved: (state, action: PayloadAction<string>) => {
      if (state.setup) {
        state.setup.services = state.setup.services.filter(item => item.id !== action.payload);
      }
    },
    documentsReceived: (state, action: PayloadAction<BusinessDocument[]>) => {
      if (state.setup) {
        state.setup.documents = action.payload;
      }
    },
    catalogReceived: (
      state,
      action: PayloadAction<{ partnerTypes: PartnerType[]; categories: Category[] }>,
    ) => {
      state.partnerTypes = action.payload.partnerTypes;
      state.categories = action.payload.categories;
    },
    /** Signing out forgets the account's data but keeps the public catalog. */
    setupReset: state => ({ ...initialState, partnerTypes: state.partnerTypes, categories: state.categories }),
  },
});

export const {
  formPatched,
  setupLoaded,
  setupSaved,
  servicesReceived,
  serviceSaved,
  serviceRemoved,
  documentsReceived,
  catalogReceived,
  setupReset,
} = setupSlice.actions;
export const setupReducer = setupSlice.reducer;

type WithSetup = { setup: SetupState };

export const useSetup = () => {
  const dispatch = useDispatch();
  const form = useSelector((state: WithSetup) => state.setup.form);
  return useMemo(
    () => ({
      form,
      update: (patch: Partial<SetupForm>) => {
        dispatch(formPatched(patch));
      },
    }),
    [dispatch, form],
  );
};

export const useBusinessSetup = () => useSelector((state: WithSetup) => state.setup.setup);
export const usePartnerTypes = () => useSelector((state: WithSetup) => state.setup.partnerTypes);
export const useCategories = () => useSelector((state: WithSetup) => state.setup.categories);

/** The chosen partner type, from the catalog or, before it loads, from the saved business. */
export const usePartnerType = () => {
  const id = useSelector((state: WithSetup) => state.setup.form.partnerTypeId);
  const types = useSelector((state: WithSetup) => state.setup.partnerTypes);
  const saved = useSelector((state: WithSetup) => state.setup.setup?.business?.partnerType);
  return types.find(type => type.id === id) ?? (saved?.id === id ? saved : undefined);
};

export const toggleItem = <T,>(list: T[], item: T): T[] =>
  list.includes(item) ? list.filter(entry => entry !== item) : [...list, item];
