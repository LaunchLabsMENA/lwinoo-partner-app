import { useEffect } from 'react';
import { useLanguage } from '../i18n';
import { useAppDispatch } from '../store/hooks';
import { loadCatalog } from '../store/thunks';

/** Loads partner types and categories once; screens that need them call this. */
export const useLoadCatalog = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(loadCatalog());
  }, [dispatch]);
};

/** Picks the Arabic name when the app is in Arabic and one exists. */
export const useLocalName = () => {
  const { lang } = useLanguage();
  return (item: { nameEn: string; nameAr: string | null }) =>
    lang === 'ar' && item.nameAr ? item.nameAr : item.nameEn;
};
