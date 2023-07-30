import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  PermissionsAndroid,
  Platform,
} from 'react-native';

import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import MapViewDirections from 'react-native-maps-directions';
import {
  GooglePlacesAutocomplete,
  GooglePlaceData,
  GooglePlaceDetail,
} from 'react-native-google-places-autocomplete';
import Geocoder from 'react-native-geocoding';
Geocoder.init('AIzaSyAx2KuYvnKN4fLS0A1IkqFlnBBCDHTmoWc');

const App = () => {
  const [currentLongitude, setCurrentLongitude] = useState(null);
  const [currentLatitude, setCurrentLatitude] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [destinationText, setDestinationText] = useState('');

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Access Required',
              message: 'This App needs to Access your location',
              buttonPositive: 'OK',
            },
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            getOneTimeLocation();
            subscribeLocationLocation();
          }
        } catch (err) {
          console.warn(err);
        }
      }
    };
    requestLocationPermission();
    return () => {
      Geolocation.clearWatch(watchID);
    };
  }, []);

  const calculateDistanceoffline = (lat1, lon1, lat2, lon2) => {
    const earthRadius = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadius * c;
    return distance; // Distance in kilometers
  };

  if (destinationCoords) {
    const distance = calculateDistance(
      currentLatitude,
      currentLongitude,
      destinationCoords.latitude,
      destinationCoords.longitude,
    );

    // Check if the distance is less than 1 km
    if (distance < 1) {
      // Trigger the alarm or display a notification here
      alert('You are less than 1 km away from the target location!');
    }
  }

  const getOneTimeLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const currentLongitude = position.coords.longitude;
        const currentLatitude = position.coords.latitude;
        setCurrentLongitude(currentLongitude);
        setCurrentLatitude(currentLatitude);
      },
      error => {
        console.warn(error.message);
      },
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 1000,
      },
    );
  };

  const subscribeLocationLocation = () => {
    watchID = Geolocation.watchPosition(
      position => {
        const currentLongitude = position.coords.longitude;
        const currentLatitude = position.coords.latitude;
        setCurrentLongitude(currentLongitude);
        setCurrentLatitude(currentLatitude);
      },
      error => {
        console.warn(error.message);
      },
      {
        enableHighAccuracy: false,
        maximumAge: 1000,
      },
    );
  };

  const handleSearch = async () => {
    console.log(destinationText);
    if (destinationText.trim() !== '') {
      try {
        // Use Geocoder to get the coordinates (latitude and longitude) from the destination text
        const response = await Geocoder.from(destinationText);
        if (response && response.results.length > 0) {
          const {lat, lng} = response.results[0].geometry.location;
          setDestinationCoords({
            latitude: lat,
            longitude: lng,
          });

          // Move the map's pointer to the selected destination
          if (mapRef.current) {
            mapRef.current.animateToRegion({
              latitude: lat,
              longitude: lng,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            });
          }
        }
      } catch (error) {
        console.error('Error performing search:', error);
      }
    }
  };

  const mapRef = React.createRef();

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.container}>
        {/* Search Input */}
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search destination"
            value={destinationText}
            onChangeText={setDestinationText}
            onSubmitEditing={handleSearch}
          />
        </View>

        {/* Map */}
        <View style={{flex: 1}}>
          {currentLatitude !== null && currentLongitude !== null && (
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              region={{
                latitude: currentLatitude,
                longitude: currentLongitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}>
              {/* Current Location Marker */}
              <Marker
                coordinate={{
                  latitude: currentLatitude,
                  longitude: currentLongitude,
                }}
                title="You are here"
              />

              {/* Destination Marker and Directions */}
              {destinationCoords !== null && (
                <>
                  <Marker
                    coordinate={destinationCoords}
                    title="Destination"
                    pinColor="blue"
                  />
                  <MapViewDirections
                    origin={{
                      latitude: currentLatitude,
                      longitude: currentLongitude,
                    }}
                    destination={destinationCoords}
                    apikey="AIzaSyAx2KuYvnKN4fLS0A1IkqFlnBBCDHTmoWc" // Replace with your Google Maps API key
                    strokeWidth={3}
                    strokeColor="blue"
                  />
                </>
              )}
            </MapView>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  searchBox: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    elevation: 3,
    padding: 5,
    zIndex: 1, // Ensure that the searchBox remains above the map
  },
});

export default App;
