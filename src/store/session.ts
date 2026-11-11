import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PartnerMe, Tokens } from '../api/types';

export interface SessionState {
  hydrated: boolean;
  tokens: Tokens | null;
  me: PartnerMe | null;
}

const initialState: SessionState = { hydrated: false, tokens: null, me: null };

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    sessionRestored: (
      state,
      action: PayloadAction<{ tokens: Tokens; me: PartnerMe | null } | null>,
    ) => {
      state.hydrated = true;
      state.tokens = action.payload?.tokens ?? null;
      state.me = action.payload?.me ?? null;
    },
    sessionStarted: (state, action: PayloadAction<{ tokens: Tokens; me: PartnerMe }>) => {
      state.tokens = action.payload.tokens;
      state.me = action.payload.me;
    },
    tokensRefreshed: (state, action: PayloadAction<Tokens>) => {
      state.tokens = action.payload;
    },
    meReceived: (state, action: PayloadAction<PartnerMe>) => {
      // A response can land after logout; it must not recreate account data.
      if (state.tokens) {
        state.me = action.payload;
      }
    },
    sessionCleared: state => {
      state.tokens = null;
      state.me = null;
    },
  },
});

export const { sessionRestored, sessionStarted, tokensRefreshed, meReceived, sessionCleared } =
  sessionSlice.actions;
export const sessionReducer = sessionSlice.reducer;
