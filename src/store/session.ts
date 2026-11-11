import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Account, BusinessSummary, Tokens } from '../api/types';

export interface SessionState {
  hydrated: boolean;
  tokens: Tokens | null;
  account: Account | null;
}

const initialState: SessionState = { hydrated: false, tokens: null, account: null };

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    sessionRestored: (
      state,
      action: PayloadAction<{ tokens: Tokens; account: Account | null } | null>,
    ) => {
      state.hydrated = true;
      state.tokens = action.payload?.tokens ?? null;
      state.account = action.payload?.account ?? null;
    },
    sessionStarted: (state, action: PayloadAction<{ tokens: Tokens; account: Account }>) => {
      state.tokens = action.payload.tokens;
      state.account = action.payload.account;
    },
    tokensRefreshed: (state, action: PayloadAction<Tokens>) => {
      state.tokens = action.payload;
    },
    accountReceived: (state, action: PayloadAction<Account>) => {
      // A response can land after logout; it must not recreate account data.
      if (state.tokens) {
        state.account = action.payload;
      }
    },
    /** Keeps the short business record in step after a save or submit. */
    businessSummaryChanged: (
      state,
      action: PayloadAction<{ business: BusinessSummary; nextAction?: Account['nextAction'] }>,
    ) => {
      if (state.account) {
        state.account.business = action.payload.business;
        state.account.nextAction = action.payload.nextAction ?? state.account.nextAction;
      }
    },
    sessionCleared: state => {
      state.tokens = null;
      state.account = null;
    },
  },
});

export const {
  sessionRestored,
  sessionStarted,
  tokensRefreshed,
  accountReceived,
  businessSummaryChanged,
  sessionCleared,
} = sessionSlice.actions;
export const sessionReducer = sessionSlice.reducer;
