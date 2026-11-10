import React, {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FONTS, FontWeightName } from '../theme';
import { Lang, TKey, translations } from './translations';

const LANG_KEY = 'lwinoo_lang';

interface LanguageValue {
  lang: Lang;
  isRTL: boolean;
  row: 'row' | 'row-reverse';
  t: (key: TKey, params?: Record<string, string | number>) => string;
  toggle: () => void;
  fontFor: (weight?: FontWeightName, heading?: boolean) => string;
}

const LanguageContext = createContext<LanguageValue | undefined>(undefined);

export const LanguageProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY)
      .then(saved => {
        if (saved === 'ar' || saved === 'en') {
          setLang(saved);
        }
      })
      .catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    setLang(current => {
      const next: Lang = current === 'en' ? 'ar' : 'en';
      AsyncStorage.setItem(LANG_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo<LanguageValue>(() => {
    const isRTL = lang === 'ar';
    return {
      lang,
      isRTL,
      row: isRTL ? 'row-reverse' : 'row',
      toggle,
      t: (key, params) => {
        const text = translations[lang][key];
        if (!params) {
          return text;
        }
        return text.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? ''));
      },
      fontFor: (weight = 'regular', heading = false) => {
        if (isRTL) {
          return FONTS.arabic[heading ? 'bold' : weight];
        }
        return heading ? FONTS.heading : FONTS.body[weight];
      },
    };
  }, [lang, toggle]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageValue => {
  const value = useContext(LanguageContext);
  if (!value) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }
  return value;
};
