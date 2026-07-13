import React, { useState, useEffect } from 'react';
import { StyleSheet, StatusBar, SafeAreaView, Alert, Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';
import Calculator from './src/components/Calculator';
import SettingsScreen from './src/screens/SettingsScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { useEmergency } from './src/hooks/useEmergency';
import { getSettings, saveSettings, EmergencySettings, CalculatorTheme } from './src/utils/settings';
import * as LocalAuthentication from 'expo-local-authentication';

export default function App(): React.JSX.Element {
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [settings, setSettings] = useState<EmergencySettings | null>(null);
  const [pinPromptVisible, setPinPromptVisible] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const { triggerEmergency } = useEmergency();

  useEffect(() => {
    loadSettings();
  }, [showSettings]);

  const loadSettings = async () => {
    const s = await getSettings();
    setSettings(s);
    if (s.isFirstLaunch) {
      setShowOnboarding(true);
    }
  };

  const handleFinishOnboarding = async (theme: CalculatorTheme) => {
    if (settings) {
      const updatedSettings = {
        ...settings,
        isFirstLaunch: false,
        theme: theme,
      };
      await saveSettings(updatedSettings);
      setSettings(updatedSettings);
    }
    setShowOnboarding(false);
  };

  const handlePinCorrect = (): void => {
    triggerEmergency();
  };

  const handleLongPressC = async (): Promise<void> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Autenticación requerida para Configuración Secreta',
          cancelLabel: 'Cancelar',
          disableDeviceFallback: false,
        });

        if (result.success) {
          setShowSettings(true);
          return;
        }
      }
      
      // Fallback if biometrics fail, are cancelled, or not supported
      setEnteredPin('');
      setPinPromptVisible(true);
    } catch (error) {
      setEnteredPin('');
      setPinPromptVisible(true);
    }
  };

  const handleVerifyPin = () => {
    const correctPin = settings?.alertPin || '1234';
    if (enteredPin === correctPin) {
      setPinPromptVisible(false);
      setShowSettings(true);
    } else {
      Alert.alert('Error', 'PIN incorrecto.');
    }
  };

  if (settings === null) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      {showOnboarding ? (
        <OnboardingScreen onFinish={handleFinishOnboarding} />
      ) : showSettings ? (
        <SettingsScreen onBack={() => setShowSettings(false)} />
      ) : (
        <Calculator 
          onPinCorrect={handlePinCorrect} 
          onLongPressC={handleLongPressC} 
          alertPin={settings.alertPin || '1234'}
          theme={settings.theme || 'ios'}
        />
      )}

      {/* Modal de PIN de Respaldo */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={pinPromptVisible}
        onRequestClose={() => setPinPromptVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Verificación Requerida</Text>
            <Text style={styles.modalSubtitle}>Ingresa tu PIN de seguridad para acceder a los ajustes</Text>
            
            <TextInput
              style={styles.pinInput}
              value={enteredPin}
              onChangeText={setEnteredPin}
              placeholder="PIN"
              placeholderTextColor="#666"
              secureTextEntry
              keyboardType="numeric"
              maxLength={10}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setPinPromptVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={handleVerifyPin}
              >
                <Text style={styles.confirmButtonText}>Ingresar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  pinInput: {
    backgroundColor: '#1c1c1c',
    color: '#fff',
    width: '100%',
    padding: 15,
    borderRadius: 12,
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 8,
    borderWidth: 1,
    borderColor: '#444',
    marginBottom: 25,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    marginRight: 10,
    backgroundColor: '#222',
  },
  cancelButtonText: {
    color: '#aaa',
    fontWeight: '600',
  },
  confirmButton: {
    marginLeft: 10,
    backgroundColor: '#f09a36',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
