import * as Keychain from 'react-native-keychain';
import type { Account, Tokens } from '../api/types';

const SERVICE = 'lwinoo.partner.session';

export type StoredSession = { tokens: Tokens; account: Account | null };

export async function readSession(): Promise<StoredSession | null> {
  try {
    const stored = await Keychain.getGenericPassword({ service: SERVICE });
    if (stored) {
      const saved = JSON.parse(stored.password) as Partial<StoredSession>;
      if (saved.tokens?.accessToken && saved.tokens.refreshToken) {
        return { tokens: saved.tokens, account: saved.account ?? null };
      }
    }
  } catch {}
  return null;
}

// Writes run in order so a slow save can't restore a session that was just cleared.
let queue: Promise<unknown> = Promise.resolve();

export const writeSession = (session: StoredSession | null) => {
  queue = queue
    .then<unknown>(() =>
      session
        ? Keychain.setGenericPassword('session', JSON.stringify(session), { service: SERVICE })
        : Keychain.resetGenericPassword({ service: SERVICE }),
    )
    .catch(() => {});
  return queue;
};
