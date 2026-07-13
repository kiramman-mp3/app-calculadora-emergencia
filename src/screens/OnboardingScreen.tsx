import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, Platform, PermissionsAndroid, Dimensions } from 'react-native';
import * as Location from 'expo-location';
import * as Contacts from 'expo-contacts';

const { width, height } = Dimensions.get('window');

interface OnboardingScreenProps {
  onFinish: () => void;
}

type PermissionStatus = 'undetermined' | 'granted' | 'denied';

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish }) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [locationPermission, setLocationPermission] = useState<PermissionStatus>('undetermined');
  const [contactsPermission, setContactsPermission] = useState<PermissionStatus>('undetermined');
  const [smsPermission, setSmsPermission] = useState<PermissionStatus>('undetermined');

  useEffect(() => {
    checkInitialPermissions();
  }, []);

  const checkInitialPermissions = async () => {
    try {
      // Geolocalización
      const { status: fgStatus } = await Location.getForegroundPermissionsAsync();
      const { status: bgStatus } = await Location.getBackgroundPermissionsAsync();
      if (fgStatus === 'granted' && bgStatus === 'granted') {
        setLocationPermission('granted');
      } else if (fgStatus === 'denied' || bgStatus === 'denied') {
        setLocationPermission('denied');
      }

      // Contactos
      const { status: cStatus } = await Contacts.getPermissionsAsync();
      if (cStatus === 'granted') {
        setContactsPermission('granted');
      } else if (cStatus === 'denied') {
        setContactsPermission('denied');
      }

      // SMS (Android)
      if (Platform.OS === 'android') {
        const hasSms = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.SEND_SMS);
        setSmsPermission(hasSms ? 'granted' : 'undetermined');
      } else {
        setSmsPermission('granted'); // iOS usa fallback de expo-sms sin este permiso nativo
      }
    } catch (e) {
      console.log('Error checking permissions:', e);
    }
  };

  const requestLocation = async () => {
    try {
      const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
      if (fgStatus !== 'granted') {
        setLocationPermission('denied');
        return;
      }
      const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
      if (bgStatus !== 'granted') {
        setLocationPermission('denied');
        return;
      }
      setLocationPermission('granted');
    } catch (e) {
      setLocationPermission('denied');
    }
  };

  const requestContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      setContactsPermission(status === 'granted' ? 'granted' : 'denied');
    } catch (e) {
      setContactsPermission('denied');
    }
  };

  const requestSms = async () => {
    if (Platform.OS !== 'android') return;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.SEND_SMS,
        {
          title: "Permiso de Envío de SMS",
          message: "CalcuRescue requiere permisos para enviar mensajes de auxilio en segundo plano sin intervención manual.",
          buttonNeutral: "Luego",
          buttonNegative: "Cancelar",
          buttonPositive: "OK"
        }
      );
      setSmsPermission(granted === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied');
    } catch (e) {
      setSmsPermission('denied');
    }
  };

  const handleNext = () => {
    if (currentSlide < 3) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onFinish();
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const renderStatus = (status: PermissionStatus) => {
    if (status === 'granted') {
      return <Text style={[styles.statusText, styles.grantedText]}>✓ Concedido</Text>;
    }
    if (status === 'denied') {
      return <Text style={[styles.statusText, styles.deniedText]}>✕ Denegado</Text>;
    }
    return <Text style={[styles.statusText, styles.pendingText]}>⚡ Pendiente</Text>;
  };

  const isAnyDenied = locationPermission === 'denied' || contactsPermission === 'denied' || (Platform.OS === 'android' && smsPermission === 'denied');

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} scrollEnabled={height < 600}>
        
        {/* Slide 1: Bienvenido */}
        {currentSlide === 0 && (
          <View style={styles.slide}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconEmoji}>🛡️</Text>
            </View>
            <Text style={styles.title}>Bienvenido a CalcuRescue</Text>
            <Text style={styles.subtitle}>Tu herramienta discreta de seguridad personal</Text>
            <View style={styles.card}>
              <Text style={styles.cardText}>
                Esta aplicación funciona como una calculadora común para evitar levantar sospechas de terceros, pero oculta herramientas críticas para enviar alertas de emergencia de forma silenciosa.
              </Text>
            </View>
          </View>
        )}

        {/* Slide 2: Acceder a Ajustes */}
        {currentSlide === 1 && (
          <View style={styles.slide}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconEmoji}>⚙️</Text>
            </View>
            <Text style={styles.title}>Acceso a Ajustes</Text>
            <Text style={styles.subtitle}>Personaliza tu configuración secreta</Text>
            <View style={styles.card}>
              <Text style={styles.bulletTitle}>¿Cómo ingresar?</Text>
              <Text style={styles.bulletText}>1. Mantén presionado el botón "C" de la calculadora por 2 segundos.</Text>
              <Text style={styles.bulletText}>2. Autentícate con tu huella digital o Face ID (o con tu PIN de seguridad).</Text>
              <Text style={styles.bulletText}>3. Configura tus contactos de confianza, mensaje SOS y cambia el PIN de alerta.</Text>
            </View>
          </View>
        )}

        {/* Slide 3: Alerta a tus Contactos */}
        {currentSlide === 2 && (
          <View style={styles.slide}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconEmoji}>🚨</Text>
            </View>
            <Text style={styles.title}>Enviar Alerta SOS</Text>
            <Text style={styles.subtitle}>Cómo pedir auxilio discretamente</Text>
            <View style={styles.card}>
              <Text style={styles.bulletTitle}>El Disparador de Alerta</Text>
              <Text style={styles.bulletText}>1. Digita tu PIN de alerta secreto (por defecto es 1234).</Text>
              <Text style={styles.bulletText}>2. Presiona el botón "=" en la calculadora.</Text>
              <Text style={styles.bulletText}>3. La aplicación enviará silenciosamente tu localización exacta de Google Maps y nivel de batería a tus contactos de confianza.</Text>
            </View>
          </View>
        )}

        {/* Slide 4: Solicitar Permisos */}
        {currentSlide === 3 && (
          <View style={styles.slide}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconEmoji}>🔓</Text>
            </View>
            <Text style={styles.title}>Permisos del Sistema</Text>
            <Text style={styles.subtitle}>Requeridos para el correcto funcionamiento</Text>

            <View style={styles.permissionsContainer}>
              {/* Localización */}
              <View style={styles.permissionRow}>
                <View style={styles.permissionInfo}>
                  <Text style={styles.permissionLabel}>Ubicación GPS (Siempre)</Text>
                  {renderStatus(locationPermission)}
                </View>
                {locationPermission !== 'granted' && (
                  <TouchableOpacity style={styles.requestButton} onPress={requestLocation}>
                    <Text style={styles.requestButtonText}>Permitir</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Contactos */}
              <View style={styles.permissionRow}>
                <View style={styles.permissionInfo}>
                  <Text style={styles.permissionLabel}>Agenda de Contactos</Text>
                  {renderStatus(contactsPermission)}
                </View>
                {contactsPermission !== 'granted' && (
                  <TouchableOpacity style={styles.requestButton} onPress={requestContacts}>
                    <Text style={styles.requestButtonText}>Permitir</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* SMS (Android) */}
              {Platform.OS === 'android' && (
                <View style={styles.permissionRow}>
                  <View style={styles.permissionInfo}>
                    <Text style={styles.permissionLabel}>Envío de SMS Directos</Text>
                    {renderStatus(smsPermission)}
                  </View>
                  {smsPermission !== 'granted' && (
                    <TouchableOpacity style={styles.requestButton} onPress={requestSms}>
                      <Text style={styles.requestButtonText}>Permitir</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            {isAnyDenied && (
              <View style={styles.warningCard}>
                <Text style={styles.warningTitle}>⚠️ Permisos Denegados Detectados</Text>
                <Text style={styles.warningText}>
                  Si has denegado un permiso, el sistema operativo no volverá a mostrar el cuadro de diálogo. Por favor, ve a la configuración del sistema de tu dispositivo y habilita manualmente los accesos de Ubicación y SMS para CalcuRescue.
                </Text>
              </View>
            )}
          </View>
        )}

      </ScrollView>

      {/* Indicador de progreso e inferior */}
      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {[0, 1, 2, 3].map((idx) => (
            <View 
              key={idx} 
              style={[
                styles.dot, 
                currentSlide === idx ? styles.activeDot : null
              ]} 
            />
          ))}
        </View>

        <View style={styles.navigationButtons}>
          {currentSlide > 0 ? (
            <TouchableOpacity style={styles.navButtonSecondary} onPress={handleBack}>
              <Text style={styles.navButtonSecondaryText}>Atrás</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyNavPlaceholder} />
          )}

          <TouchableOpacity style={styles.navButtonPrimary} onPress={handleNext}>
            <Text style={styles.navButtonPrimaryText}>
              {currentSlide === 3 ? 'Comenzar' : 'Siguiente'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'space-between',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingTop: 40,
    paddingBottom: 20,
  },
  slide: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 30,
  },
  iconEmoji: {
    fontSize: 40,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#222',
  },
  cardText: {
    color: '#ccc',
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
  },
  bulletTitle: {
    color: '#f09a36',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  bulletText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 10,
  },
  permissionsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  permissionInfo: {
    flex: 1,
  },
  permissionLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  grantedText: {
    color: '#4cd964',
  },
  deniedText: {
    color: '#ff3b30',
  },
  pendingText: {
    color: '#ffcc00',
  },
  requestButton: {
    backgroundColor: '#f09a36',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  warningCard: {
    backgroundColor: '#261313',
    borderColor: '#4d1c1c',
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    width: '100%',
    marginTop: 10,
  },
  warningTitle: {
    color: '#ff3b30',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  warningText: {
    color: '#e0c0c0',
    fontSize: 12,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 25,
    paddingBottom: 40,
    paddingTop: 10,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 25,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#f09a36',
    width: 20,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  navButtonPrimary: {
    flex: 1,
    backgroundColor: '#f09a36',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 10,
  },
  navButtonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  navButtonSecondary: {
    flex: 1,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  navButtonSecondaryText: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyNavPlaceholder: {
    flex: 1,
    marginRight: 10,
  },
});

export default OnboardingScreen;
