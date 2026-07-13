import React, { useState } from 'react';
import { StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import Calculator from './src/components/Calculator';
import SettingsScreen from './src/screens/SettingsScreen';
import { useEmergency } from './src/hooks/useEmergency';

export default function App(): React.JSX.Element {
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const { triggerEmergency } = useEmergency();

  const handlePinCorrect = (): void => {
    // Secretly trigger emergency
    triggerEmergency();
  };

  const handleLongPressC = (): void => {
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
