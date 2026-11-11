import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Image, StatusBar, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Video from 'react-native-video';
import { useAppNavigation } from '../../navigation/types';
import { useAppDispatch } from '../../store/hooks';
import { resetTo, type Route } from '../../navigation/route-for';
import { bootstrap } from '../../store/thunks';
import { COLORS } from '../../theme';

const SPLASH_VIDEO_SEEN_KEY = 'splash_video_seen';

// Safety net in case the video never fires onEnd.
const MAX_SPLASH_MS = 12000;
const LOGO_SPLASH_MS = 1500;

type Mode = 'loading' | 'video' | 'logo';

export const SplashScreen: FC = () => {
  const navigation = useAppNavigation();
  const done = useRef(false);
  const [mode, setMode] = useState<Mode>('loading');
  const dispatch = useAppDispatch();
  const boot = useRef<Promise<Route[]> | null>(null);

  const finish = useCallback(async () => {
    if (done.current) {
      return;
    }
    done.current = true;
    navigation.reset(resetTo((await boot.current) ?? [{ name: 'Login' }]));
  }, [navigation]);

  useEffect(() => {
    boot.current = dispatch(bootstrap())
      .unwrap()
      .catch(() => [{ name: 'Login' as const }]);
  }, [dispatch]);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(SPLASH_VIDEO_SEEN_KEY)
      .then(seen => {
        if (!cancelled) {
          setMode(seen ? 'logo' : 'video');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMode('logo');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (mode === 'loading') {
      return;
    }
    if (mode === 'video') {
      AsyncStorage.setItem(SPLASH_VIDEO_SEEN_KEY, '1').catch(() => {});
    }
    const id = setTimeout(finish, mode === 'video' ? MAX_SPLASH_MS : LOGO_SPLASH_MS);
    return () => clearTimeout(id);
  }, [mode, finish]);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      {mode === 'video' && (
        <Video
          source={require('../../assets/video/splash.mp4')}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          repeat={false}
          controls={false}
          ignoreSilentSwitch="obey"
          disableFocus
          onEnd={finish}
          onError={finish}
        />
      )}
      {mode === 'logo' && (
        <Image
          source={require('../../assets/logo/lwinoo-logo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.splash,
  },
  logo: { width: 160, height: 160, borderRadius: 32 },
});
