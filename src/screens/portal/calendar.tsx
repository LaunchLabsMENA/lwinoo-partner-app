import React, { FC, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ChevronLeftIcon, ChevronRightIcon } from '../../components/icons';
import { PortalScreen, SmallButton } from '../../components/portal';
import { T, useComingSoon } from '../../components/ui';
import {
  CALENDAR_SLOTS,
  CALENDAR_START,
  CalendarSlot,
  MONTHS,
  SCHEDULE_DAY,
} from '../../data/portal';
import { DAYS } from '../../data/setup';
import { useLanguage } from '../../i18n';
import { COLORS } from '../../theme';

// Slightly under 1/7 so rounding can never push the seventh day onto a new row.
const DAY_WIDTH = '14.28%';

const monthCells = (month: Date): Date[] => {
  const year = month.getFullYear();
  const index = month.getMonth();
  const offset = new Date(year, index, 1).getDay();
  const days = new Date(year, index + 1, 0).getDate();
  const count = Math.ceil((offset + days) / 7) * 7;
  return Array.from({ length: count }, (_, i) => new Date(year, index, i - offset + 1));
};

const SLOT_BACKGROUND: Record<CalendarSlot['status'], string> = {
  booked: COLORS.background,
  ongoing: COLORS.slotOngoing,
  available: COLORS.white,
  blocked: COLORS.slotBlocked,
};

const SlotRow: FC<{ slot: CalendarSlot }> = ({ slot }) => {
  const { t, row } = useLanguage();
  const idle = slot.status === 'available' || slot.status === 'blocked';
  const idleLabel = slot.status === 'available' ? 'calendar.available' : 'calendar.blocked';

  return (
    <View
      style={[styles.slot, { flexDirection: row, backgroundColor: SLOT_BACKGROUND[slot.status] }]}
    >
      <T style={styles.slotTime}>{slot.time}</T>
      {slot.client ? (
        <T weight="medium" style={styles.slotClient}>
          {slot.client}
        </T>
      ) : null}
      <T
        numberOfLines={1}
        style={[styles.slotDetail, slot.status === 'available' && styles.slotAvailable]}
      >
        {idle ? t(idleLabel) : slot.detail && t(slot.detail)}
      </T>
      <View style={[styles.slotDot, slot.status === 'available' && styles.slotDotIdle]} />
    </View>
  );
};

export const CalendarScreen: FC = () => {
  const { t, row, isRTL } = useLanguage();
  const comingSoon = useComingSoon();
  const [month, setMonth] = useState(CALENDAR_START.month);
  const [range, setRange] = useState({
    start: CALENDAR_START.rangeStart,
    end: CALENDAR_START.rangeEnd,
  });

  const shiftMonth = (delta: number) =>
    setMonth(current => new Date(current.getFullYear(), current.getMonth() + delta, 1));

  // A complete range restarts on the next tap; a single day extends forward.
  const pickDay = (day: number) =>
    setRange(current =>
      current.start !== current.end || day < current.start
        ? { start: day, end: day }
        : { start: current.start, end: day },
    );

  const arrows = [
    { delta: -1, label: t('calendar.previous'), Icon: isRTL ? ChevronRightIcon : ChevronLeftIcon },
    { delta: 1, label: t('calendar.next'), Icon: isRTL ? ChevronLeftIcon : ChevronRightIcon },
  ];

  const arrow = ({ delta, label, Icon }: (typeof arrows)[number]) => (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => shiftMonth(delta)}
      style={styles.arrow}
    >
      <Icon size={16} />
    </TouchableOpacity>
  );

  return (
    <PortalScreen title={t('calendar.title')}>
      <View style={[styles.monthBar, { flexDirection: row }]}>
        {arrow(arrows[0])}
        <View style={[styles.monthName, { flexDirection: row }]}>
          <T weight="semibold" style={styles.monthText}>
            {t(MONTHS[month.getMonth()])}
          </T>
          <T style={[styles.monthText, styles.monthYear]}>{month.getFullYear()}</T>
        </View>
        {arrow(arrows[1])}
      </View>

      <View style={[styles.grid, { flexDirection: row }]}>
        {DAYS.map(day => (
          <View key={day.id} style={styles.weekday}>
            <T style={styles.weekdayLabel}>{t(day.label).charAt(0)}</T>
          </View>
        ))}
        {monthCells(month).map(date => {
          const time = date.getTime();
          const edge = time === range.start || time === range.end;
          const inside = time > range.start && time < range.end;
          const outside = date.getMonth() !== month.getMonth();
          return (
            <TouchableOpacity
              key={time}
              accessibilityRole="button"
              accessibilityState={{ selected: edge || inside }}
              onPress={() => pickDay(time)}
              style={[styles.day, inside && styles.dayInside, edge && styles.dayEdge]}
            >
              <T
                weight="medium"
                style={[
                  styles.dayLabel,
                  outside && styles.dayOutside,
                  edge && styles.dayLabelEdge,
                ]}
              >
                {date.getDate()}
              </T>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={[styles.scheduleHeader, { flexDirection: row }]}>
        <View style={styles.flex}>
          <T weight="semibold" style={styles.scheduleDate}>
            {SCHEDULE_DAY.label}
          </T>
          <T style={styles.scheduleSummary}>
            {t('calendar.summary', { n: SCHEDULE_DAY.bookings, p: SCHEDULE_DAY.utilisation })}
          </T>
        </View>
        <SmallButton label={t('calendar.block')} onPress={comingSoon} />
      </View>

      {CALENDAR_SLOTS.map(slot => (
        <SlotRow key={slot.time} slot={slot} />
      ))}
    </PortalScreen>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  monthBar: {
    height: 42,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    backgroundColor: COLORS.white,
  },
  arrow: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthName: { gap: 5 },
  monthText: { fontSize: 13 },
  monthYear: { color: COLORS.placeholder },
  grid: { flexWrap: 'wrap', marginTop: 10 },
  weekday: { width: DAY_WIDTH, height: 30, alignItems: 'center', justifyContent: 'center' },
  weekdayLabel: { fontSize: 11, color: COLORS.placeholder, textAlign: 'center' },
  day: { width: DAY_WIDTH, height: 44, alignItems: 'center', justifyContent: 'center' },
  dayInside: { backgroundColor: COLORS.roseSoft },
  dayEdge: { backgroundColor: COLORS.rose, borderRadius: 10 },
  dayLabel: { fontSize: 13, textAlign: 'center' },
  dayOutside: { color: COLORS.placeholder },
  dayLabelEdge: { color: COLORS.white },
  scheduleHeader: { alignItems: 'center', marginTop: 16, marginBottom: 8, gap: 12 },
  scheduleDate: { fontSize: 17 },
  scheduleSummary: { fontSize: 12, color: COLORS.muted, marginTop: 3 },
  slot: {
    height: 38,
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    marginTop: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.roseSoft,
  },
  slotTime: { width: 62, fontSize: 12, color: COLORS.muted },
  slotClient: { fontSize: 12.5 },
  slotDetail: { flex: 1, fontSize: 12.5, color: COLORS.muted },
  slotAvailable: { color: COLORS.placeholder },
  slotDot: { width: 5, height: 5, backgroundColor: COLORS.espresso },
  slotDotIdle: { backgroundColor: COLORS.placeholder },
});
