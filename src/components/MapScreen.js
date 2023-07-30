import React, {useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

const MapScreen = () => {
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setCurrentLocation({latitude, longitude});
      },
      error => console.log('Error getting location:', error),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
    );
  }, []);

  return (
    <View style={{flex: 1}}>
      {currentLocation ? (
        <MapView
          style={{flex: 1}}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}>
          <Markers
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="You are here"
          />
        </MapView>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
};

export default MapScreen;
