import { NativeModules, Platform, Alert, PermissionsAndroid } from 'react-native';
import * as SMS from 'expo-sms';

interface SMSModuleType {
  sendSMS(phoneNumber: string, message: string): Promise<string>;
}

const SMSModule = NativeModules.SMSModule as SMSModuleType | undefined;

export const sendSilentSMS = async (phoneNumber: string, message: string): Promise<string> => {
  console.log(`[!] Iniciando envío automático para: ${phoneNumber}`);

  // 1. INTENTO: Módulo Nativo Automático (Directo desde el dispositivo)
  if (Platform.OS === 'android' && SMSModule) {
    try {
      // Solicitar permisos de SMS y Estado del Teléfono explícitamente
      const grants = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.SEND_SMS,
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
      ]);

      const smsGranted = grants[PermissionsAndroid.PERMISSIONS.SEND_SMS] === PermissionsAndroid.RESULTS.GRANTED;
      const phoneStateGranted = grants[PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE] === PermissionsAndroid.RESULTS.GRANTED;

      if (smsGranted && phoneStateGranted) {
        console.log('Permisos de SMS y Teléfono concedidos. Intentando envío nativo silencioso...');
        const result = await SMSModule.sendSMS(phoneNumber, message);
        console.log('Resultado nativo:', result);
        return result;
      } else {
        console.warn('Permisos requeridos denegados por el usuario.');
      }
    } catch (error) {
      console.error('Error en envío nativo:', error);
      // Fallback si falla el nativo
    }
  }

  // 2. INTENTO: Expo SMS (Fallback NO silencioso si el nativo no está disponible)
  try {
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      console.log('Abriendo selector de SMS (expo-sms)...');
      const { result } = await SMS.sendSMSAsync([phoneNumber], message);
      return result;
    }
  } catch (error) {
    console.log('expo-sms fallback failed:', error);
  }

  // 3. FALLBACK: Simulación (Depuración)
  if (__DEV__) {
    console.log(`[SIMULACIÓN] SMS para ${phoneNumber}: ${message}`);
    Alert.alert(
      "Alerta (Simulada)", 
      "El envío automático requiere una build nativa. Revise la consola para detalles."
    );
  }
  
  return 'SIMULATED';
};
