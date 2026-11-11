import { COUNTRIES, DEFAULT_COUNTRY, flagOf } from '../src/data/countries';
import { toE164 } from '../src/utils/phone';

const country = (iso: string) => COUNTRIES.find(item => item.iso === iso)!;

test('every country has a code, an English and an Arabic name; Saudi Arabia is the default', () => {
  expect(COUNTRIES.length).toBeGreaterThan(240);
  expect(COUNTRIES.every(item => item.dial && item.en && item.ar)).toBe(true);
  expect(DEFAULT_COUNTRY).toMatchObject({ iso: 'SA', dial: '966' });
  expect(flagOf('SA')).toBe('🇸🇦');
});

test('numbers become international for the chosen country', () => {
  const sa = country('SA');
  expect(toE164('0512345678', sa)).toBe('+966512345678');
  expect(toE164('51 234 5678', sa)).toBe('+966512345678');
  expect(toE164('+966 51 234 5678', sa)).toBe('+966512345678');
  expect(toE164('050 123 4567', country('AE'))).toBe('+971501234567');
  expect(toE164('07400 123456', country('GB'))).toBe('+447400123456');
  expect(toE164('12345', sa)).toBeNull();
  expect(toE164('', sa)).toBeNull();
});
