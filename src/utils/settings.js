import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@emergency_settings';

export const getSettings = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? {
      contacts: [],
      message: 'Necesito ayuda. Mi ubicación:',
      ...JSON.parse(jsonValue)
    } : {
      contacts: [],
      message: 'Necesito ayuda. Mi ubicación:',
    };
  } catch (e) {
    return { 
      contacts: [], 
      message: 'Necesito ayuda. Mi ubicación:',
    };
  }
};

export const saveSettings = async (settings) => {
  try {
    const jsonValue = JSON.stringify(settings);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error('Error saving settings:', e);
  }
};
