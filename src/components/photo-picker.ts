import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';
import {
  CameraOptions,
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import { useLanguage } from '../i18n';

const OPTIONS: CameraOptions = {
  mediaType: 'photo',
  quality: 0.8,
  maxWidth: 1600,
  maxHeight: 1600,
};

// iOS drops an alert raised while the previous one is still closing, and the picker can fail
// immediately after the choice dialog is tapped.
const ALERT_AFTER_DIALOG_MS = 500;

const showAfterDialog = (show: () => void) => setTimeout(show, ALERT_AFTER_DIALOG_MS);

export type PickedImage = { uri: string; type: string };

const UPLOAD_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

type OnPicked = (image: PickedImage) => void;

/** Asks camera or library, handles permissions, and reports the chosen picture. */
export const usePhotoPicker = () => {
  const { t } = useLanguage();

  const showDenied = () =>
    Alert.alert(t('photo.deniedTitle'), t('photo.deniedBody'), [
      { text: t('photo.cancel'), style: 'cancel' },
      { text: t('photo.openSettings'), onPress: () => Linking.openSettings() },
    ]);

  const handleResponse = (response: ImagePickerResponse, onPicked: OnPicked) => {
    if (response.didCancel) {
      return;
    }
    if (response.errorCode === 'permission') {
      showAfterDialog(showDenied);
      return;
    }
    if (response.errorCode === 'camera_unavailable') {
      showAfterDialog(() => Alert.alert(t('photo.unavailable')));
      return;
    }
    const asset = response.assets?.[0];
    if (response.errorCode || !asset?.uri) {
      showAfterDialog(() => Alert.alert(t('photo.failed')));
      return;
    }
    onPicked({
      uri: asset.uri,
      type: asset.type && UPLOAD_TYPES.includes(asset.type) ? asset.type : 'image/jpeg',
    });
  };

  const fromCamera = async (onPicked: OnPicked) => {
    // iOS prompts on its own from NSCameraUsageDescription; Android needs an explicit request.
    if (Platform.OS === 'android') {
      const status = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
      if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        showAfterDialog(showDenied);
      }
      if (status !== PermissionsAndroid.RESULTS.GRANTED) {
        return;
      }
    }
    handleResponse(await launchCamera(OPTIONS), onPicked);
  };

  const fromLibrary = async (onPicked: OnPicked) =>
    handleResponse(await launchImageLibrary({ ...OPTIONS, selectionLimit: 1 }), onPicked);

  return (onPicked: OnPicked) =>
    Alert.alert(t('photo.title'), undefined, [
      { text: t('photo.camera'), onPress: () => fromCamera(onPicked) },
      { text: t('photo.library'), onPress: () => fromLibrary(onPicked) },
      { text: t('photo.cancel'), style: 'cancel' },
    ]);
};
