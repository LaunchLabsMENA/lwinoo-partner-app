import React, { FC, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Circle, type Region } from 'react-native-maps';
import { errorMessage } from '../api/errors';
import { reversePlace, searchPlaces } from '../api/geo';
import type { Place } from '../api/types';
import { useLanguage } from '../i18n';
import { COLORS } from '../theme';
import { PinIcon, SearchIcon } from './icons';
import { Input, T } from './ui';

export interface PickedLocation {
  latitude: number;
  longitude: number;
}

const DEGREES_PER_KM = 1 / 111;

/** Zoom that fits the service radius, with some margin around it. */
const regionFor = ({ latitude, longitude }: PickedLocation, radiusKm: number): Region => {
  const latitudeDelta = Math.max(radiusKm, 2) * 2.6 * DEGREES_PER_KM;
  return {
    latitude,
    longitude,
    latitudeDelta,
    longitudeDelta: latitudeDelta / Math.max(Math.cos((latitude * Math.PI) / 180), 0.2),
  };
};

/**
 * The pin stays in the middle of the map; moving the map moves the location.
 * Addresses come from the API's geocoder (the Google key stays on the server).
 */
export const LocationPicker: FC<{
  value: PickedLocation;
  radiusKm: number | null;
  onChange: (location: PickedLocation) => void;
}> = ({ value, radiusKm, onChange }) => {
  const { t, lang, row } = useLanguage();
  const map = useRef<MapView>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);
  const [address, setAddress] = useState('');
  const [hint, setHint] = useState('');
  const [locating, setLocating] = useState(false);

  // Search as the person types, a moment after they stop.
  useEffect(() => {
    const text = query.trim();
    if (text.length < 3) {
      setResults([]);
      return;
    }
    let current = true;
    const id = setTimeout(async () => {
      setSearching(true);
      try {
        const places = await searchPlaces(text, lang);
        if (current) {
          setResults(places);
          setHint('');
        }
      } catch (problem) {
        if (current) {
          setResults([]);
          setHint(errorMessage(problem, t));
        }
      } finally {
        if (current) {
          setSearching(false);
        }
      }
    }, 400);
    return () => {
      current = false;
      clearTimeout(id);
    };
  }, [query, lang, t]);

  // Name the place under the pin.
  useEffect(() => {
    let current = true;
    const id = setTimeout(async () => {
      try {
        const place = await reversePlace(value.latitude, value.longitude, lang);
        if (current) {
          setAddress(place?.formattedAddress ?? '');
          setHint('');
        }
      } catch (problem) {
        if (current) {
          setAddress('');
          setHint(errorMessage(problem, t));
        }
      }
    }, 600);
    return () => {
      current = false;
      clearTimeout(id);
    };
  }, [value.latitude, value.longitude, lang, t]);

  useEffect(() => {
    map.current?.animateToRegion(regionFor(value, radiusKm ?? 3), 300);
    // Only re-zoom when the radius changes; pans are the person's own.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radiusKm]);

  const moveTo = (location: PickedLocation) => {
    onChange(location);
    map.current?.animateToRegion(regionFor(location, radiusKm ?? 3), 400);
  };

  const pick = (place: Place) => {
    setQuery('');
    setResults([]);
    setAddress(place.formattedAddress);
    moveTo({ latitude: place.latitude, longitude: place.longitude });
  };

  const locate = async () => {
    if (Platform.OS === 'android') {
      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (status !== PermissionsAndroid.RESULTS.GRANTED) {
        setHint(t('area.locationDenied'));
        return;
      }
    }
    // On iOS, showing the user's location asks for permission (NSLocationWhenInUseUsageDescription).
    setLocating(true);
  };

  return (
    <View>
      <View style={[styles.search, { flexDirection: row }]}>
        <SearchIcon size={18} color={COLORS.muted} />
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder={t('area.search')}
          returnKeyType="search"
          style={styles.searchInput}
        />
        {searching ? <ActivityIndicator size="small" color={COLORS.rose} /> : null}
      </View>
      {results.length ? (
        <View style={styles.results}>
          {results.map(place => (
            <TouchableOpacity
              key={place.placeId}
              accessibilityRole="button"
              onPress={() => pick(place)}
              style={styles.result}
            >
              <T style={styles.resultText} numberOfLines={2}>
                {place.formattedAddress}
              </T>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      <View style={styles.map}>
        <MapView
          ref={map}
          style={StyleSheet.absoluteFill}
          initialRegion={regionFor(value, radiusKm ?? 3)}
          showsUserLocation={locating}
          onUserLocationChange={event => {
            const coordinate = event.nativeEvent.coordinate;
            if (locating && coordinate) {
              setLocating(false);
              moveTo({ latitude: coordinate.latitude, longitude: coordinate.longitude });
            }
          }}
          onRegionChangeComplete={(region, details) => {
            // Ignore the map settling by itself; follow the person's own drags.
            if (details?.isGesture !== false) {
              onChange({ latitude: region.latitude, longitude: region.longitude });
            }
          }}
          toolbarEnabled={false}
        >
          {radiusKm ? (
            <Circle
              center={value}
              radius={radiusKm * 1000}
              fillColor="rgba(198,147,146,0.28)"
              strokeColor={COLORS.rose}
              strokeWidth={1.5}
            />
          ) : null}
        </MapView>
        <View pointerEvents="none" style={styles.pinWrap}>
          <PinIcon size={36} color={COLORS.espresso} />
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t('area.myLocation')}
          onPress={locate}
          style={styles.locate}
        >
          {locating ? (
            <ActivityIndicator size="small" color={COLORS.rose} />
          ) : (
            <T weight="medium" style={styles.locateText}>
              {t('area.myLocation')}
            </T>
          )}
        </TouchableOpacity>
      </View>
      <T style={styles.address} numberOfLines={2}>
        {hint || address || t('area.moveMap')}
      </T>
    </View>
  );
};

const styles = StyleSheet.create({
  search: {
    height: 48,
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    backgroundColor: COLORS.white,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    borderWidth: 0,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    fontSize: 14,
  },
  results: {
    marginTop: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },
  result: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.hairline,
  },
  resultText: { fontSize: 13 },
  map: {
    height: 240,
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.hairline,
  },
  // The pin's tip sits on the map's centre.
  pinWrap: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -18,
    marginTop: -33,
  },
  locate: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locateText: { fontSize: 12, color: COLORS.espresso },
  address: { fontSize: 12, color: COLORS.muted, marginTop: 8 },
});
