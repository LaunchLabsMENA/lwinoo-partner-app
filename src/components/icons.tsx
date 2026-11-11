import React, { FC } from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { COLORS } from '../theme';

export interface IconProps {
  size?: number;
  color?: string;
}

const line = (d: string): FC<IconProps> => ({ size = 22, color = COLORS.espresso }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d={d} stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const BackIcon = line('M20 12H4M10 6l-6 6 6 6');
export const ArrowRightIcon = line('M4 12h16M14 6l6 6-6 6');
export const ChevronDownIcon = line('M6 9l6 6 6-6');
export const PlusIcon = line('M12 5v14M5 12h14');
export const UploadIcon = line('M12 19V6M6 11.5L12 5.5l6 6');
export const CheckIcon = line('M5 13l4.5 4.5L19 7.5');
export const ChevronLeftIcon = line('M15 5l-7 7 7 7');
export const ChevronRightIcon = line('M9 5l7 7-7 7');
export const HomeIcon = line('M4 10.5L12 4l8 6.5V20H4zM9.5 20v-5.5a2.5 2.5 0 015 0V20');
export const BookIcon = line(
  'M6 4h13v16H7.5A2.5 2.5 0 015 17.5V5a1 1 0 011-1zM5 17.5A2.5 2.5 0 017.5 15H19M10 4v6.5l2.5-1.8 2.5 1.8V4',
);
export const HairDryerIcon = line(
  'M3 7.5L11.5 5a5 5 0 110 10L3 12.5zM11.5 8a2 2 0 100 4 2 2 0 000-4zM9 14.5l1.2 6.5h2.6l.7-6M13 18.5c2 0 3 .7 3 2.5',
);
export const CalendarIcon = line(
  'M5 6h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1zM8 3.5V8M16 3.5V8M4 11h16',
);
export const UserIcon = line(
  'M12 11.5a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5zM5 20.5c.6-4 3.4-6 7-6s6.4 2 7 6',
);
export const SearchIcon = line('M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4-4');
export const BellIcon = line('M6 16.5V11a6 6 0 1112 0v5.5l1.5 1.5h-15zM10 20.5a2.2 2.2 0 004 0');
export const PinIcon = line(
  'M12 21s-7-6.2-7-11.5a7 7 0 0114 0C19 14.8 12 21 12 21zM12 12a2.4 2.4 0 100-4.8 2.4 2.4 0 000 4.8z',
);
export const ClockIcon = line('M12 21a9 9 0 100-18 9 9 0 000 18zM12 7.5V12l3 2');
export const CoinsIcon = line(
  'M12 4c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3zM4 7v5c0 1.7 3.6 3 8 3s8-1.3 8-3V7M4 12v5c0 1.7 3.6 3 8 3s8-1.3 8-3v-5',
);
export const LockIcon = line(
  'M7 11h10a1.5 1.5 0 011.5 1.5v6A1.5 1.5 0 0117 20H7a1.5 1.5 0 01-1.5-1.5v-6A1.5 1.5 0 017 11zM8.5 11V8a3.5 3.5 0 017 0v3',
);
export const ShieldOutlineIcon = line(
  'M12 3l7.5 2.8v5.7c0 4.6-3.1 7.9-7.5 9.5-4.4-1.6-7.5-4.9-7.5-9.5V5.8z',
);
export const LinkIcon = line(
  'M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1',
);
export const GlobeIcon = line(
  'M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.500 5.5 12 3z',
);
export const TrashIcon = line('M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v5M14 11v5');

export const SparkleIcon: FC<IconProps> = ({ size = 12, color = COLORS.gold }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" fill={color} />
  </Svg>
);

export const CameraIcon: FC<IconProps> = ({ size = 24, color = COLORS.rose }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 8h3.5l1.5-2.5h6L16.5 8H20a1 1 0 011 1v9.5a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z"
      stroke={color}
      strokeWidth={1.4}
      strokeLinejoin="round"
    />
    <Circle cx={12} cy={13.5} r={3.4} stroke={color} strokeWidth={1.4} />
  </Svg>
);

export const ShieldIcon: FC<IconProps> = ({ size = 12, color = COLORS.rose }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2l8 3v6.5c0 5-3.4 8.8-8 10.5-4.6-1.7-8-5.5-8-10.5V5l8-3z"
      fill={color}
    />
  </Svg>
);

export const GoogleIcon: FC<IconProps> = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Path
      fill="#FFC107"
      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
    />
    <Path
      fill="#FF3D00"
      d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
    />
    <Path
      fill="#4CAF50"
      d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
    />
    <Path
      fill="#1976D2"
      d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
    />
  </Svg>
);

export const AppleIcon: FC<IconProps> = ({ size = 22, color = COLORS.espresso }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill={color}
      d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
    />
  </Svg>
);
