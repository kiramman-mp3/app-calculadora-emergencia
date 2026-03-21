import { sendSilentSMS } from '../services/SMSModule';
import { getCurrentLocation } from '../services/LocationService';
import { getSettings } from '../utils/settings';

export const useEmergency = () => {
  const triggerEmergency = async () => {
    try {
      const settings = await getSettings();
      const contacts = settings.contacts;
      const messageBase = settings.message;

      if (!contacts || contacts.length === 0) {
        console.warn('No contact configured for emergency.');
        return;
      }

      const location = await getCurrentLocation();
      const fullMessage = `${messageBase} ${location.googleMapsLink}`;

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
