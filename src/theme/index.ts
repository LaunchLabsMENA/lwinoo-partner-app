export const COLORS = {
  espresso: '#433C34',
  rose: '#C69392',
  roseSoft: '#EBDFDE',
  chip: '#EFE5E3',
  background: '#F9F5F4',
  white: '#FFFFFF',
  hairline: '#F0E6E4',
  muted: '#8E8781',
  placeholder: '#A39C96',
  activeFill: '#EBF6EE',
  activeBorder: '#3F7D58',
  error: '#B3261E',
  danger: '#DC524B',
  gold: '#E2BE4E',
  slotOngoing: '#E4E2E0',
  slotBlocked: '#EEEDEB',
  splash: '#D9A7AD',
};

export const FONTS = {
  body: {
    regular: 'DMSans-Regular',
    medium: 'DMSans-Medium',
    semibold: 'DMSans-SemiBold',
    bold: 'DMSans-Bold',
  },
  arabic: {
    regular: 'Tajawal-Regular',
    medium: 'Tajawal-Medium',
    semibold: 'Tajawal-Bold',
    bold: 'Tajawal-Bold',
  },
  heading: 'PlayfairDisplay-Bold',
};

export type FontWeightName = keyof typeof FONTS.body;
