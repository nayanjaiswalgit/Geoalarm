import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import MapViewDirections from 'react-native-maps-directions'; // Install using: npm install react-native-maps-directions

const MainScreen = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [alarmDistance, setAlarmDistance] = useState(1); // Default alarm distance in km

  useEffect(() => {
    // Get the user's current location
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setCurrentLocation({latitude, longitude});
      },
      error => console.log(error),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
    );
  }, []);

  const handleCalculateRoute = () => {
    // Use a routing API (e.g., Google Directions API) to get the route coordinates
    // Update the state with the routeCoordinates received from the API
    // This is just a placeholder for demonstration purposes
    setRouteCoordinates([
      {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      },
      {latitude: 37.78825, longitude: -122.4324}, // Destination latitude and longitude
    ]);
  };

  const handleMapPress = event => {
    // When the user clicks on the map, update the destination based on the selected location
    setDestination(
      `${event.nativeEvent.coordinate.latitude}, ${event.nativeEvent.coordinate.longitude}`,
    );
  };

  // Calculate the distance between two coordinates in kilometers
  const getDistance = (lat1, lon1, lat2, lon2) => {
    // Implementation of Haversine formula for distance calculation
    // This is just a placeholder for demonstration purposes
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  useEffect(() => {
    // Check if the user is near the destination to trigger the alarm
    if (currentLocation && destination) {
      const [destLat, destLon] = destination
        .split(',')
        .map(coord => parseFloat(coord.trim()));
      const distance = getDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        destLat,
        destLon,
      );
      if (distance <= alarmDistance) {
        // Trigger the alarm here
        alert('You are near your destination!');
      }
    }
  }, [currentLocation, destination, alarmDistance]);

  return (
    <View style={styles.container}>
      {currentLocation && (
        <MapView
          style={styles.map}
          region={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          onPress={handleMapPress}>
          {destination ? (
            <>
              <Marker coordinate={currentLocation} title="Current Location" />
              <Marker
                coordinate={{latitude: destLat, longitude: destLon}}
                title="Destination"
              />
              <MapViewDirections
                origin={currentLocation}
                destination={{latitude: destLat, longitude: destLon}}
                apikey={YOUR_GOOGLE_MAPS_API_KEY} // Replace with your Google Maps API key
                strokeWidth={3}
                strokeColor="blue"
                onReady={result => {
                  setRouteCoordinates(result.coordinates);
                }}
              />
            </>
          ) : (
            <Marker coordinate={currentLocation} title="Current Location" />
          )}
        </MapView>
      )}
      <View style={styles.searchContainer}>
        {/* Search bar and other UI components */}
        {/* ... */}
        <TouchableOpacity
          style={styles.calculateButton}
          onPress={handleCalculateRoute}>
          <Text style={styles.buttonText}>Calculate Route</Text>
        </TouchableOpacity>
        {/* ... */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  searchContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  calculateButton: {
    backgroundColor: 'blue',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MainScreen;
