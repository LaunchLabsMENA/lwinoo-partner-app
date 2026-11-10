import React, { createContext, FC, ReactNode, useContext, useMemo, useState } from 'react';

export interface SetupForm {
  partner: 'beauty' | 'fashion';
  photoAdded: boolean;
  coverAdded: boolean;
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
  documents: string[];
}

const INITIAL: SetupForm = {
  partner: 'beauty',
  photoAdded: false,
  coverAdded: false,
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

interface SetupValue {
  form: SetupForm;
  update: (patch: Partial<SetupForm>) => void;
}

const SetupContext = createContext<SetupValue | undefined>(undefined);

export const SetupProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [form, setForm] = useState(INITIAL);
  const value = useMemo<SetupValue>(
    () => ({ form, update: patch => setForm(current => ({ ...current, ...patch })) }),
    [form],
  );
  return <SetupContext.Provider value={value}>{children}</SetupContext.Provider>;
};

export const useSetup = (): SetupValue => {
  const value = useContext(SetupContext);
  if (!value) {
    throw new Error('useSetup must be used inside SetupProvider');
  }
  return value;
};

export const toggleItem = (list: string[], item: string): string[] =>
  list.includes(item) ? list.filter(entry => entry !== item) : [...list, item];
