import { useCallback } from 'react';
import { useAppDispatch } from '../store/hooks';
import { saveDraft } from '../store/thunks';

/** Saves progress in the background so a slow connection never blocks the next step. */
export const useDraftSync = () => {
  const dispatch = useAppDispatch();
  return useCallback(() => {
    dispatch(saveDraft());
  }, [dispatch]);
};
