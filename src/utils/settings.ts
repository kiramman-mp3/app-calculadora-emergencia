import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@emergency_settings';

export interface EmergencySettings {
  contacts: string[];
  message: string;
  alertPin?: string;
  isFirstLaunch?: boolean;
}

const DEFAULT_SETTINGS: EmergencySettings = {
  contacts: [],
  message: 'Necesito ayuda. Mi ubicación:',
  alertPin: '1234',
  isFirstLaunch: true,
};

export const getSettings = async (): Promise<EmergencySettings> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue != null) {
      const parsed = JSON.parse(jsonValue);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
      };
    }
    return DEFAULT_SETTINGS;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = async (settings: EmergencySettings): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(settings);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error('Error saving settings:', e);
  }
};
