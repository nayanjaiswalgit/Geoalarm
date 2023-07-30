import React from 'react';
import {View, StyleSheet} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

const MapWithMarkers = ({currentCoords, destinationCoords}) => {
  return (
    <View style={styles.map}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={currentCoords}>
        {currentCoords !== null && (
          <Marker
            coordinate={{
              latitude: currentCoords.latitude,
              longitude: currentCoords.longitude,
            }}
            title="You are here"
          />
        )}
        {destinationCoords !== null && (
          <>
            <Marker
              coordinate={destinationCoords}
              title="Destination"
              pinColor="blue"
            />
            <MapViewDirections
              origin={currentCoords}
              destination={destinationCoords}
              apikey={API_KEY}
              strokeWidth={4}
              strokeColor="grey"
            />
          </>
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    height: '100%',
    marginVertical: 50,
  },
});

export default MapWithMarkers;
