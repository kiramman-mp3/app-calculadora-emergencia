import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, Modal, FlatList, SafeAreaView } from 'react-native';
import { getSettings, saveSettings, CalculatorTheme, EmergencySettings } from '../utils/settings';
import * as Contacts from 'expo-contacts';

interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const [contacts, setContacts] = useState<string[]>(['']);
  const [message, setMessage] = useState<string>('');
  const [alertPin, setAlertPin] = useState<string>('1234');
  const [theme, setTheme] = useState<CalculatorTheme>('ios');
  const [loading, setLoading] = useState<boolean>(true);

  // Selector de contactos
  const [contactsModalVisible, setContactsModalVisible] = useState<boolean>(false);
  const [deviceContacts, setDeviceContacts] = useState<Contacts.Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeContactIndex, setActiveContactIndex] = useState<number | null>(null);

  const filteredContacts = deviceContacts.filter(c => {
    const fullName = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const settings = await getSettings();
      setContacts(settings.contacts.length > 0 ? settings.contacts : ['']);
      setMessage(settings.message);
      setAlertPin(settings.alertPin || '1234');
      setTheme(settings.theme || 'ios');
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const validatePhone = (phone: string): boolean => {
    // Basic phone validation: needs to start with + and have at least 10 digits
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleSave = async () => {
    const validContacts = contacts.map(c => c.trim()).filter(c => c !== '');
    
    if (validContacts.length === 0) {
      Alert.alert('Error', 'Debes agregar al menos un contacto.');
      return;
    }

    const invalidContacts = validContacts.filter(c => !validatePhone(c));
    if (invalidContacts.length > 0) {
      Alert.alert('Error', 'Algunos números de teléfono no son válidos. Asegúrate de incluir el código de país (ej: +57...).');
      return;
    }

    const pinTrimmed = alertPin.trim();
    if (!/^[0-9]{4,8}$/.test(pinTrimmed)) {
      Alert.alert('Error', 'El PIN de alerta debe ser numérico y tener entre 4 y 8 dígitos.');
      return;
    }

    await saveSettings({ 
      contacts: validContacts, 
      message: message.trim() || 'Necesito ayuda. Mi ubicación:',
      alertPin: pinTrimmed,
      theme: theme,
      isFirstLaunch: false,
    });
    Alert.alert('Éxito', 'Configuración guardada correctamente.');
    onBack();
  };

  const addContact = () => {
    if (contacts.length >= 5) {
      Alert.alert('Límite alcanzado', 'Puedes agregar un máximo de 5 contactos.');
      return;
    }
    setContacts([...contacts, '']);
  };

  const removeContact = (index: number) => {
    const newContacts = contacts.filter((_, i) => i !== index);
    setContacts(newContacts.length > 0 ? newContacts : ['']);
  };

  const updateContact = (text: string, index: number) => {
    const newContacts = [...contacts];
    newContacts[index] = text;
    setContacts(newContacts);
  };

  const openContactPicker = async (index: number) => {
    setActiveContactIndex(index);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
        });
        if (data.length > 0) {
          // Filtrar solo contactos que tengan números de teléfono
          const validContacts = data.filter(c => c.phoneNumbers && c.phoneNumbers.length > 0);
          setDeviceContacts(validContacts);
          setSearchQuery('');
          setContactsModalVisible(true);
        } else {
          Alert.alert('Info', 'No se encontraron contactos en tu agenda.');
        }
      } else {
        Alert.alert('Permiso denegado', 'No se puede acceder a tus contactos sin permiso.');
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudieron leer los contactos.');
    }
  };

  const handleSelectContact = (contact: Contacts.Contact) => {
    if (activeContactIndex === null) return;
    
    const phoneNumbers = contact.phoneNumbers;
    if (!phoneNumbers || phoneNumbers.length === 0) {
      Alert.alert('Error', 'Este contacto no tiene números de teléfono.');
      return;
    }

    let number = phoneNumbers[0].number || '';
    
    // Limpieza de caracteres del número
    number = number.replace(/[\s\-\(\)]/g, '');
    
    const newContacts = [...contacts];
    newContacts[activeContactIndex] = number;
    setContacts(newContacts);
    
    setContactsModalVisible(false);
  };

  if (loading) return <View style={styles.container}><Text style={styles.title}>Cargando...</Text></View>;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Configuración Secreta</Text>
        <Text style={styles.subtitle}>Configura tus contactos de emergencia</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.label}>Mensaje de Alerta</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={message}
            onChangeText={setMessage}
            placeholder="Ej: Auxilio, estoy en peligro..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={3}
          />
          <Text style={styles.hint}>Se enviará junto con tu ubicación de Google Maps.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>PIN de Alerta Secreto</Text>
          <TextInput
            style={styles.input}
            value={alertPin}
            onChangeText={setAlertPin}
            placeholder="Ej: 1234"
            placeholderTextColor="#666"
            keyboardType="numeric"
            secureTextEntry
            maxLength={8}
          />
          <Text style={styles.hint}>PIN numérico (4-8 dígitos) que activará la alerta al presionar "=".</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Tema de Camuflaje (Calculadora)</Text>
          <View style={styles.themeRow}>
            <TouchableOpacity 
              style={[styles.themeOptionButton, theme === 'ios' && styles.themeOptionButtonActive]}
              onPress={() => setTheme('ios')}
            >
              <Text style={[styles.themeOptionText, theme === 'ios' && styles.themeOptionTextActive]}>iOS (Apple)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.themeOptionButton, theme === 'samsung' && styles.themeOptionButtonActive]}
              onPress={() => setTheme('samsung')}
            >
              <Text style={[styles.themeOptionText, theme === 'samsung' && styles.themeOptionTextActive]}>Samsung</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.themeOptionButton, theme === 'xiaomi' && styles.themeOptionButtonActive]}
              onPress={() => setTheme('xiaomi')}
            >
              <Text style={[styles.themeOptionText, theme === 'xiaomi' && styles.themeOptionTextActive]}>Xiaomi</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>Muestra la interfaz adaptada al estilo de calculadora de esta marca.</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>Contactos de Confianza</Text>
            <TouchableOpacity onPress={addContact}>
              <Text style={styles.addLink}>+ Agregar</Text>
            </TouchableOpacity>
          </View>
          
          {contacts.map((contact, index) => (
            <View key={index} style={styles.contactRow}>
              <TextInput
                style={[styles.input, styles.contactInput]}
                value={contact}
                onChangeText={(text) => updateContact(text, index)}
                placeholder="Ej: +573001234567"
                placeholderTextColor="#666"
                keyboardType="phone-pad"
              />
              <TouchableOpacity 
                style={styles.pickerButton} 
                onPress={() => openContactPicker(index)}
              >
                <Text style={styles.pickerText}>👤</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={() => removeContact(index)}
              >
                <Text style={styles.deleteText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Guardar Cambios</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Descartar</Text>
        </TouchableOpacity>
      </View>

      {/* Modal del Selector de Contactos */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={contactsModalVisible}
        onRequestClose={() => setContactsModalVisible(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.contactsModalContent}>
            <View style={styles.contactsModalHeader}>
              <Text style={styles.contactsModalTitle}>Seleccionar Contacto</Text>
              <TouchableOpacity onPress={() => setContactsModalVisible(false)}>
                <Text style={styles.closeModalText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.searchBar}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar por nombre..."
              placeholderTextColor="#666"
              clearButtonMode="while-editing"
            />
            
            <FlatList
              data={filteredContacts}
              keyExtractor={(item) => (item as any).id || Math.random().toString()}
              renderItem={({ item }) => {
                const name = `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.name || 'Sin Nombre';
                const mainPhone = item.phoneNumbers && item.phoneNumbers[0]?.number;
                return (
                  <TouchableOpacity 
                    style={styles.contactItem}
                    onPress={() => handleSelectContact(item)}
                  >
                    <Text style={styles.contactItemName}>{name}</Text>
                    {mainPhone && <Text style={styles.contactItemPhone}>{mainPhone}</Text>}
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.contactSeparator} />}
              ListEmptyComponent={() => (
                <View style={styles.emptyContacts}>
                  <Text style={styles.emptyContactsText}>No se encontraron contactos</Text>
                </View>
              )}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 25,
    paddingBottom: 20,
    backgroundColor: '#111',
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 25,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    color: '#f09a36',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#1c1c1c',
    color: '#fff',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactInput: {
    flex: 1,
  },
  deleteButton: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    backgroundColor: '#331111',
    borderRadius: 10,
  },
  deleteText: {
    color: '#ff4444',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addLink: {
    color: '#f09a36',
    fontWeight: 'bold',
  },
  hint: {
    color: '#555',
    fontSize: 12,
    marginTop: 8,
  },
  footer: {
    padding: 25,
    paddingBottom: 40,
    backgroundColor: '#111',
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  saveButton: {
    backgroundColor: '#f09a36',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#f09a36',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  backButton: {
    marginTop: 15,
    padding: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#888',
    fontSize: 16,
  },
  pickerButton: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    backgroundColor: '#222',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  pickerText: {
    color: '#aaa',
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  contactsModalContent: {
    flex: 1,
    backgroundColor: '#111',
    width: '100%',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderWidth: 1,
    borderColor: '#222',
    padding: 20,
    marginTop: Platform.OS === 'ios' ? 50 : 20,
  },
  contactsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  contactsModalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  closeModalText: {
    color: '#f09a36',
    fontWeight: 'bold',
    fontSize: 16,
  },
  searchBar: {
    backgroundColor: '#1c1c1c',
    color: '#fff',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 15,
  },
  contactItem: {
    paddingVertical: 15,
  },
  contactItemName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  contactItemPhone: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
  },
  contactSeparator: {
    height: 1,
    backgroundColor: '#222',
  },
  emptyContacts: {
    padding: 30,
    alignItems: 'center',
  },
  emptyContactsText: {
    color: '#666',
    fontSize: 16,
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  themeOptionButton: {
    flex: 1,
    backgroundColor: '#1c1c1e',
    borderWidth: 1.5,
    borderColor: '#333',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  themeOptionButtonActive: {
    borderColor: '#f09a36',
    backgroundColor: '#26170d',
  },
  themeOptionText: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '600',
  },
  themeOptionTextActive: {
    color: '#f09a36',
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
