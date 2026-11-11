import React, { FC, ReactNode, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { CalendarIcon, ClockIcon, CoinsIcon } from '../../components/icons';
import { PortalScreen, SearchField, SectionTitle } from '../../components/portal';
import { Chip, OutlineButton, T, useComingSoon } from '../../components/ui';
import { Booking, BOOKING_FILTERS, BookingFilter, BOOKINGS } from '../../data/portal';
import { useLanguage } from '../../i18n';
import { COLORS } from '../../theme';

const Meta: FC<{ icon: ReactNode; label: string }> = ({ icon, label }) => {
  const { row } = useLanguage();
  return (
    <View style={[styles.meta, { flexDirection: row }]}>
      {icon}
      <T style={styles.metaLabel}>{label}</T>
    </View>
  );
};

const BookingCard: FC<{ booking: Booking }> = ({ booking }) => {
  const { t, row } = useLanguage();
  const comingSoon = useComingSoon();
  const pending = booking.status === 'pending';

  return (
    <View style={styles.card}>
      <T weight="medium" style={styles.client}>
        {booking.client}
      </T>
      <T style={styles.service}>{t(booking.service)}</T>
      <View style={[styles.metaRow, { flexDirection: row }]}>
        <Meta icon={<CalendarIcon size={15} color={COLORS.rose} />} label={booking.date} />
        <Meta icon={<ClockIcon size={15} color={COLORS.rose} />} label={booking.time} />
        <Meta
          icon={<CoinsIcon size={15} color={COLORS.rose} />}
          label={t('bookings.price', { n: booking.price })}
        />
      </View>
      <View style={[styles.actions, { flexDirection: row }]}>
        <OutlineButton
          label={t(pending ? 'bookings.accept' : 'bookings.complete')}
          onPress={comingSoon}
          color={pending ? COLORS.white : COLORS.activeBorder}
          borderColor={pending ? COLORS.espresso : COLORS.activeBorder}
          backgroundColor={pending ? COLORS.espresso : COLORS.activeFill}
          style={styles.flex}
        />
        <OutlineButton
          label={t('bookings.reschedule')}
          onPress={comingSoon}
          color={COLORS.muted}
          borderColor={COLORS.hairline}
          backgroundColor={COLORS.background}
          style={styles.flex}
        />
      </View>
    </View>
  );
};

export const BookingsScreen: FC = () => {
  const { t, row } = useLanguage();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<BookingFilter>('all');

  const needle = query.trim().toLowerCase();
  const visible = BOOKINGS.filter(
    booking =>
      (filter === 'all' || booking.location === filter) &&
      `${booking.client} ${t(booking.service)}`.toLowerCase().includes(needle),
  );
  const pending = visible.filter(booking => booking.status === 'pending');
  const upcoming = visible.filter(booking => booking.status === 'upcoming');

  return (
    <PortalScreen title={t('bookings.title')}>
      <SearchField
        placeholder={t('bookings.search')}
        value={query}
        onChangeText={setQuery}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
        contentContainerStyle={[styles.filterRow, { flexDirection: row }]}
      >
        {BOOKING_FILTERS.map(option => (
          <Chip
            key={option.id}
            label={t(option.label)}
            selected={filter === option.id}
            onPress={() => setFilter(option.id)}
            style={styles.filter}
          />
        ))}
      </ScrollView>

      {pending.map(booking => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
      {upcoming.length > 0 ? <SectionTitle>{t('bookings.upcoming')}</SectionTitle> : null}
      {upcoming.map(booking => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
      {visible.length === 0 ? <T style={styles.empty}>{t('portal.noResults')}</T> : null}
    </PortalScreen>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  filters: { marginHorizontal: -20, marginTop: 14 },
  filterRow: { gap: 8, paddingHorizontal: 20 },
  filter: { height: 38, borderRadius: 19, paddingHorizontal: 14 },
  card: {
    padding: 14,
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    backgroundColor: COLORS.white,
  },
  client: { fontSize: 16 },
  service: { fontSize: 12, color: COLORS.muted, marginTop: 3 },
  metaRow: { flexWrap: 'wrap', columnGap: 10, rowGap: 6, marginTop: 10 },
  meta: { alignItems: 'center', gap: 4 },
  metaLabel: { fontSize: 12 },
  actions: { gap: 8, marginTop: 12 },
  empty: { fontSize: 14, color: COLORS.muted, textAlign: 'center', marginTop: 32 },
});
