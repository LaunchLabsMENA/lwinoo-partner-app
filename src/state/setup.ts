import { useMemo } from 'react';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { OnboardingData, UploadedDocument } from '../api/types';

export interface SetupForm {
  partner: 'beauty' | 'fashion';
  photoUrl: string | null;
  coverUrl: string | null;
  ownerName: string;
  businessName: string;
  description: string;
  phone: string;
  services: string[];
  city: string | null;
  address: string | null;
  team: string;
  days: string[];
  timeStart: string;
  timeEnd: string;
  breakEnabled: boolean;
  breakStart: string;
  breakEnd: string;
  area: 'travel' | 'clients';
  radius: number;
  inactiveServices: string[];
  documents: UploadedDocument[];
}

export const INITIAL_FORM: SetupForm = {
  partner: 'beauty',
  photoUrl: null,
  coverUrl: null,
  ownerName: '',
  businessName: '',
  description: '',
  phone: '',
  services: [],
  city: null,
  address: null,
  team: '6-10',
  days: ['mon', 'tue', 'wed', 'thu'],
  timeStart: '08:00',
  timeEnd: '22:00',
  breakEnabled: true,
  breakStart: '01:00',
  breakEnd: '02:00',
  area: 'travel',
  radius: 15,
  inactiveServices: [],
  documents: [],
};

export const toOnboarding = (form: SetupForm): OnboardingData => ({
  partnerType: form.partner,
  photoUrl: form.photoUrl,
  coverUrl: form.coverUrl,
  ownerName: form.ownerName.trim(),
  businessName: form.businessName.trim(),
  description: form.description.trim(),
  phone: form.phone.replace(/\D/g, ''),
  services: form.services,
  city: form.city,
  address: form.address,
  team: form.team,
  days: form.days,
  timeStart: form.timeStart,
  timeEnd: form.timeEnd,
  breakEnabled: form.breakEnabled,
  breakStart: form.breakStart,
  breakEnd: form.breakEnd,
  area: form.area,
  radius: form.radius,
  inactiveServices: form.inactiveServices,
  documents: form.documents,
});

/** Fields the server hasn't stored yet may arrive null, so they keep the form's defaults. */
export const fromOnboarding = (data: Partial<OnboardingData>): SetupForm => {
  const { partnerType, ...rest } = data;
  const present = Object.fromEntries(
    Object.entries(rest).filter(([, value]) => value !== null && value !== undefined),
  );
  return { ...INITIAL_FORM, ...present, partner: partnerType ?? INITIAL_FORM.partner };
};

export interface SetupState {
  form: SetupForm;
  draftFailed: boolean;
}

const initialState: SetupState = { form: INITIAL_FORM, draftFailed: false };

const setupSlice = createSlice({
  name: 'setup',
  initialState,
  reducers: {
    formPatched: (state, action: PayloadAction<Partial<SetupForm>>) => {
      Object.assign(state.form, action.payload);
    },
    formLoaded: (state, action: PayloadAction<Partial<OnboardingData>>) => {
      state.form = fromOnboarding(action.payload);
      state.draftFailed = false;
    },
    draftResult: (state, action: PayloadAction<{ failed: boolean }>) => {
      state.draftFailed = action.payload.failed;
    },
    setupReset: () => initialState,
  },
});

export const { formPatched, formLoaded, draftResult, setupReset } = setupSlice.actions;
export const setupReducer = setupSlice.reducer;

type WithSetup = { setup: SetupState };

export const useDraftFailed = () => useSelector((state: WithSetup) => state.setup.draftFailed);

export const useSetup = () => {
  const dispatch = useDispatch();
  const form = useSelector((state: WithSetup) => state.setup.form);
  return useMemo(
    () => ({
      form,
      update: (patch: Partial<SetupForm>) => {
        dispatch(formPatched(patch));
      },
      load: (data: Partial<OnboardingData>) => {
        dispatch(formLoaded(data));
      },
    }),
    [dispatch, form],
  );
};

export const toggleItem = (list: string[], item: string): string[] =>
  list.includes(item) ? list.filter(entry => entry !== item) : [...list, item];
