import { configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { connectSession } from '../api/client';
import { resetToLogin } from '../navigation/ref';
import { setupReducer, setupReset, type SetupState } from '../state/setup';
import {
  accountReceived,
  businessSummaryChanged,
  sessionCleared,
  sessionReducer,
  sessionStarted,
  tokensRefreshed,
  type SessionState,
} from './session';
import { writeSession } from './session-storage';

type State = { session: SessionState; setup: SetupState };

export const createAppStore = () => {
  const listeners = createListenerMiddleware<State>();

  listeners.startListening({
    matcher: isAnyOf(
      sessionStarted,
      tokensRefreshed,
      accountReceived,
      businessSummaryChanged,
      sessionCleared,
    ),
    effect: (_, { getState }) => {
      const { tokens, account } = getState().session;
      writeSession(tokens ? { tokens, account } : null);
    },
  });

  listeners.startListening({
    actionCreator: sessionCleared,
    effect: (_, { dispatch }) => {
      dispatch(setupReset());
      resetToLogin();
    },
  });

  const store = configureStore({
    reducer: { session: sessionReducer, setup: setupReducer },
    middleware: getDefault => getDefault().prepend(listeners.middleware),
  });

  connectSession({
    getTokens: () => store.getState().session.tokens,
    onRefreshed: tokens => store.dispatch(tokensRefreshed(tokens)),
    onExpired: () => store.dispatch(sessionCleared()),
  });

  return store;
};

export const store = createAppStore();

export type AppStore = ReturnType<typeof createAppStore>;
export type AppDispatch = AppStore['dispatch'];
export type { RootState } from './types';
