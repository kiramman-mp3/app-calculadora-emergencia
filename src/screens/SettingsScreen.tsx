import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { getSettings, saveSettings } from '../utils/settings';

interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const [contacts, setContacts] = useState<string[]>(['']);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const settings = await getSettings();
      setContacts(settings.contacts.length > 0 ? settings.contacts : ['']);
      setMessage(settings.message);
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

    await saveSettings({ 
      contacts: validContacts, 
      message: message.trim() || 'Necesito ayuda. Mi ubicación:',
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
});

export default SettingsScreen;
