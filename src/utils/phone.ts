import { parsePhoneNumberFromString } from 'libphonenumber-js';
import type { Country } from '../data/countries';

/**
 * The number in international form (+9665…), or null when it isn't a valid number for the
 * country. Accepts local style (05…), without the trunk zero, or a full +code typed in.
 */
export const toE164 = (raw: string, country: Country): string | null => {
  const parsed = parsePhoneNumberFromString(raw.trim(), country.iso);
  return parsed?.isValid() ? parsed.number : null;
};
