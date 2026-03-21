import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import Calculator from './src/components/Calculator';
import SettingsScreen from './src/screens/SettingsScreen';
import { useEmergency } from './src/hooks/useEmergency';

export default function App() {
  const [showSettings, setShowSettings] = useState(false);
  const { triggerEmergency } = useEmergency();

  const handlePinCorrect = () => {
    // Secretly trigger emergency
    triggerEmergency();
  };

  const handleLongPressC = () => {
    // Reveal settings
    setShowSettings(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      {showSettings ? (
        <SettingsScreen onBack={() => setShowSettings(false)} />
      ) : (
        <Calculator 
          onPinCorrect={handlePinCorrect} 
          onLongPressC={handleLongPressC} 
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
