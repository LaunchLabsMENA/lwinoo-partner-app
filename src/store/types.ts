import type { SetupState } from '../state/setup';
import type { SessionState } from './session';

export interface RootState {
  session: SessionState;
  setup: SetupState;
}
