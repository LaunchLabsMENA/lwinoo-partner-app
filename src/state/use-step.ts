import { useCallback, useState } from 'react';
import { errorMessage, LOCKED_CODES, toApiError } from '../api/errors';
import { useLanguage } from '../i18n';
import { resetTo, setupRoutes } from '../navigation/route-for';
import { useAppNavigation } from '../navigation/types';

/**
 * Runs a save for a setup screen: one at a time, with the error shown in the screen's words.
 * A locked application goes to the status screen; a missing business goes back to step 1.
 */
export const useStepRunner = () => {
  const navigation = useAppNavigation();
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState('');

  const run = useCallback(
    async (task: () => Promise<unknown>, onDone?: () => void) => {
      if (busy) {
        return;
      }
      setBusy(true);
      setFailure('');
      try {
        await task();
        onDone?.();
      } catch (problem) {
        const error = toApiError(problem);
        if (LOCKED_CODES.includes(error.code)) {
          navigation.reset(resetTo([{ name: 'UnderReview' }]));
          return;
        }
        if (error.code === 'BUSINESS_NOT_FOUND') {
          navigation.reset(resetTo(setupRoutes(null)));
          return;
        }
        setFailure(errorMessage(error, t));
      } finally {
        setBusy(false);
      }
    },
    [busy, navigation, t],
  );

  return { busy, failure, setFailure, run };
};
