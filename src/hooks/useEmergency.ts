import { sendSilentSMS } from '../services/SMSModule';
import { getCurrentLocation } from '../services/LocationService';
import { getSettings } from '../utils/settings';
import * as Battery from 'expo-battery';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

export const EMERGENCY_TASK_NAME = 'emergency-location-task';

// Definir la tarea en segundo plano
TaskManager.defineTask(EMERGENCY_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background task error:', error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const location = locations[0];
    if (location) {
      try {
        const settings = await getSettings();
        const contacts = settings.contacts;
        const messageBase = settings.message;

        if (!contacts || contacts.length === 0) return;

        // Obtener batería
        let batteryInfo = '';
        try {
          const batteryLevel = await Battery.getBatteryLevelAsync();
          if (batteryLevel >= 0) {
            batteryInfo = ` (Batería: ${Math.round(batteryLevel * 100)}%)`;
          }
        } catch (e) {
          console.log(e);
        }

        const mapsLink = `https://www.google.com/maps/search/?api=1&query=${location.coords.latitude},${location.coords.longitude}`;
        const accuracyInfo = ` [Precisión: ±${Math.round(location.coords.accuracy || 0)}m]`;
        const fullMessage = `${messageBase} ${mapsLink}${batteryInfo}${accuracyInfo}`;

        // Enviar SMS
        for (const contact of contacts) {
          if (contact && contact.trim()) {
            await sendSilentSMS(contact.trim(), fullMessage);
          }
        }
      } catch (err) {
        console.error('Error in background SMS loop:', err);
      } finally {
        // Detener inmediatamente el rastreo para apagar el Foreground Service
        await Location.stopLocationUpdatesAsync(EMERGENCY_TASK_NAME);
      }
    }
  }
});

export const useEmergency = () => {
  const triggerEmergency = async (): Promise<void> => {
    try {
      const settings = await getSettings();
      const contacts = settings.contacts;

      if (!contacts || contacts.length === 0) {
        console.warn('No contact configured for emergency.');
        return;
      }

      // Solicitar permisos de primer y segundo plano
      const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
      if (fgStatus !== 'granted') {
        throw new Error('Foreground location permission denied');
      }

      const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
      if (bgStatus !== 'granted') {
        console.warn('Background location permission denied, running in foreground only...');
        
        // Ejecución en primer plano como plan de respaldo
        const location = await getCurrentLocation();
        
        let batteryInfo = '';
        try {
          const batteryLevel = await Battery.getBatteryLevelAsync();
          if (batteryLevel >= 0) {
            batteryInfo = ` (Batería: ${Math.round(batteryLevel * 100)}%)`;
          }
        } catch (e) {
          console.log(e);
        }

        let accuracyInfo = '';
        if (location.accuracy !== null) {
          accuracyInfo = ` [Precisión: ±${Math.round(location.accuracy)}m]`;
        }

        const fullMessage = `${settings.message} ${location.googleMapsLink}${batteryInfo}${accuracyInfo}`;
        for (const contact of contacts) {
          if (contact && contact.trim()) {
            await sendSilentSMS(contact.trim(), fullMessage);
          }
        }
        return;
      }

      // Iniciar actualizaciones de ubicación en segundo plano con servicio en primer plano persistente
      await Location.startLocationUpdatesAsync(EMERGENCY_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        timeInterval: 2000,
        distanceInterval: 1,
        foregroundService: {
          notificationTitle: 'CalcuRescue Activo',
          notificationBody: 'Enviando señal de alerta de seguridad...',
          notificationColor: '#f09a36',
        },
      });
    } catch (error) {
      console.log('E_TRG_ERR'); 
    }
  };

  return { triggerEmergency };
};
