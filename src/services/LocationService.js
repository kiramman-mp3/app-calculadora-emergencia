import * as Location from 'expo-location';

export const getCurrentLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access location was denied');
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      googleMapsLink: `https://www.google.com/maps/search/?api=1&query=${location.coords.latitude},${location.coords.longitude}`,
    };
  } catch (error) {
    console.error('Error getting location:', error);
    throw error;
  }
};
