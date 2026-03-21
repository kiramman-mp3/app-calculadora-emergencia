import { NativeModules, Platform, Alert, PermissionsAndroid } from 'react-native';
import * as SMS from 'expo-sms';

const { SMSModule } = NativeModules;

export const sendSilentSMS = async (phoneNumber, message) => {
  console.log(`[!] Iniciando envío automático para: ${phoneNumber}`);

  // 1. INTENTO: Módulo Nativo Automático (Directo desde el dispositivo)
  if (Platform.OS === 'android' && SMSModule) {
    try {
      // Solicitar permiso explícitamente si aún no se tiene
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.SEND_SMS,
        {
          title: "Permiso para enviar SMS",
          message: "Esta aplicación necesita enviar mensajes SMS durante emergencias.",
          buttonNeutral: "Luego",
          buttonNegative: "Cancelar",
          buttonPositive: "OK"
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Permiso concedido. Intentando envío nativo silencioso...');
        const result = await SMSModule.sendSMS(phoneNumber, message);
        console.log('Resultado nativo:', result);
        return result;
      } else {
        console.warn('Permiso de SMS denegado por el usuario.');
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
