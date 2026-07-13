import { sendSilentSMS } from '../services/SMSModule';
import { getCurrentLocation } from '../services/LocationService';
import { getSettings } from '../utils/settings';
import * as Battery from 'expo-battery';

export const useEmergency = () => {
  const triggerEmergency = async (): Promise<void> => {
    try {
      const settings = await getSettings();
      const contacts = settings.contacts;
      const messageBase = settings.message;

      if (!contacts || contacts.length === 0) {
        console.warn('No contact configured for emergency.');
        return;
      }

      // 1. Obtener geolocalización
      const location = await getCurrentLocation();

      // 2. Obtener nivel de batería asíncronamente
      let batteryInfo = '';
      try {
        const batteryLevel = await Battery.getBatteryLevelAsync();
        if (batteryLevel >= 0) {
          batteryInfo = ` (Batería: ${Math.round(batteryLevel * 100)}%)`;
        }
      } catch (e) {
        console.log('Error getting battery level:', e);
      }

      // 3. Obtener precisión del GPS
      let accuracyInfo = '';
      if (location.accuracy !== null) {
        accuracyInfo = ` [Precisión: ±${Math.round(location.accuracy)}m]`;
      }

      const fullMessage = `${messageBase} ${location.googleMapsLink}${batteryInfo}${accuracyInfo}`;

      // 4. Enviar SMS
      for (const contact of contacts) {
        if (contact && contact.trim()) {
          await sendSilentSMS(contact.trim(), fullMessage);
        }
      }
    } catch (error) {
      // Silently log error, do not show to user to maintain discretion
      console.log('E_TRG_ERR'); 
    }
  };

  return { triggerEmergency };
};
