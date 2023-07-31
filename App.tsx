import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  TouchableOpacity,
  Text,
  TextInput,
  Alert,
  Button,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import {
  GooglePlacesAutocomplete,
  GooglePlaceData,
  GooglePlaceDetail,
} from 'react-native-google-places-autocomplete';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import Geolocation from '@react-native-community/geolocation';
import MapViewDirections from 'react-native-maps-directions';
import axios from 'axios';
import Sound from 'react-native-sound';

const API_KEY = 'AIzaSyAx2KuYvnKN4fLS0A1IkqFlnBBCDHTmoWc';
Sound.setCategory('Playback');

const App = () => {
  const mapRef = useRef<MapView>(null);
  Geocoder.init(API_KEY);

  const region = {
    latitude: 20.5937, // India's latitude
    longitude: 78.9629, // India's longitude
    latitudeDelta: 25, // Adjust the zoom level as needed
    longitudeDelta: 25,
  };
  const [currentCoords, setCurrentCoords] = useState(region);
  const [destinationText, setDestinationText] = useState('');
  const [isLoading, setisLoading] = useState(false);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [desiredDistance, setDesiredDistance] = useState<string>('0');
  const [isAlertShown, setIsAlertShown] = useState<boolean>(false);
  const [alarm, setAlarm] = useState(false);

  const ding = useRef<Sound | null>(null);

  const calculateDistanceUsingAPI = async (
    sourceLatitude: number,
    sourceLongitude: number,
    destinationLatitude: number,
    destinationLongitude: number,
  ) => {
    try {
      setisLoading(true);
      console.log('fetch distance');
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${sourceLatitude},${sourceLongitude}&destinations=${destinationLatitude},${destinationLongitude}&key=${API_KEY}`,
      );

      if (
        response.data &&
        response.data.rows.length > 0 &&
        response.data.rows[0].elements.length > 0 &&
        response.data.rows[0].elements[0].status === 'OK'
      ) {
        const distanceInMeters =
          response.data.rows[0].elements[0].distance.value;
        const distanceInKilometers = distanceInMeters / 1000; // Convert meters to kilometers
        return distanceInKilometers;
      } else {
        throw new Error('Error calculating distance.');
      }
    } catch (error) {
      console.error('Error calculating distance:', error);
      throw error;
    }
  };

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

  const subscribeLocationLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const currentLongitude = position.coords.longitude;
        const currentLatitude = position.coords.latitude;
        setCurrentCoords(prev => ({
          ...prev,
          latitude: currentLatitude,
          longitude: currentLongitude,
        }));
      },
      error => {
        console.warn(error.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
      },
    );

    // Set up interval to update current location every 10 seconds
    const intervalId = setInterval(() => {
      Geolocation.getCurrentPosition(
        position => {
          const currentLongitude = position.coords.longitude;
          const currentLatitude = position.coords.latitude;
          setCurrentCoords(prev => ({
            ...prev,
            latitude: currentLatitude,
            longitude: currentLongitude,
          }));
        },
        error => {
          console.warn(error.message);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 1000,
        },
      );
    }, 10000);

    // Clear the interval when component unmounts
    return () => clearInterval(intervalId);
  };

  const getOneTimeLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const currentLatitude = position.coords.latitude;
        const currentLongitude = position.coords.longitude;
        setCurrentCoords({
          latitude: currentLatitude,
          longitude: currentLongitude,
          latitudeDelta: 0.1, // Adjust the zoom level as needed
          longitudeDelta: 0.1,
        });
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

  const handleDesiredDistanceChange = (text: string) => {
    setDesiredDistance(text);
  };

  const handleSetDesiredDistance = () => {
    if (!Number.isNaN(parseFloat(desiredDistance))) {
      Alert.alert(
        'Desired Distance Set',
        `Alert will trigger when within ${desiredDistance} km from the destination.`,
      );
    }
    setIsAlertShown(false);
    setAlarm(false);
  };

  const handleAlarmOff = () => {
    ding?.current?.pause();
    setAlarm(true);
  };

  const playAlarm = () => {
    if (ding.current) {
      ding.current.play(success => {
        if (success) {
          console.log('successfully finished playing');
          if (!alarm) {
            playAlarm();
          }
        } else {
          console.log('playback failed due to audio decoding errors');
        }
      });
    }
  };

  const calculateDistance = async () => {
    if (destinationCoords) {
      console.log('calculation distance');
      try {
        const inkm = await calculateDistanceUsingAPI(
          currentCoords?.latitude!,
          currentCoords?.longitude!,
          destinationCoords.latitude,
          destinationCoords.longitude,
        );
        setisLoading(false);
        setDistance(inkm);
      } catch (error) {
        console.error('Error calculating distance:', error);
        setDistance(null);
      }
    }
  };

  useEffect(() => {
    ding.current = new Sound('alarm.mp3', Sound.MAIN_BUNDLE, error => {
      if (error) {
        console.log('failed to load the sound', error);
        return;
      }

      console.log(
        'duration in seconds: ' +
          ding.current!.getDuration() +
          ' number of channels: ' +
          ding.current!.getNumberOfChannels(),
      );
    });

    return () => {
      if (ding.current) {
        ding.current.release();
        ding.current = null;
      }
    };
  }, []);

  useEffect(() => {
    calculateDistance();

    // Add a condition to check if distance is within the desiredDistance and if the alert has not been shown yet
    if (
      !isAlertShown &&
      distance !== null &&
      parseFloat(desiredDistance) > 0 &&
      parseFloat(distance.toString()) < parseFloat(desiredDistance)
    ) {
      setIsAlertShown(true); // Set the alertShown state to true so that the alert won't show multiple times
      setAlarm(false); // Reset the alarm state
      playAlarm(); // Play the alarm sound
      Alert.alert('Alert', 'You are within the desired distance.');
    }
  }, [
    currentCoords,
    destinationCoords,
    distance,
    desiredDistance,
    isAlertShown,
  ]);

  const handleSearch = async (destinationTexts: string) => {
    if (destinationTexts.trim() !== '') {
      try {
        const response = await Geocoder.from(destinationTexts);

        if (response && response.results.length > 0) {
          const {lat, lng} = response.results[0].geometry.location;
          setDestinationCoords({
            latitude: lat,
            longitude: lng,
            latitudeDelta: 2,
            longitudeDelta: 2,
          });

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

  return (
    <SafeAreaView>
      <View style={styles.Container}>
        <View style={styles.searchBox}>
          <GooglePlacesAutocomplete
            placeholder="Search destination"
            onPress={(
              data: GooglePlaceData,
              details: GooglePlaceDetail | null = null,
            ) => {
              if (data.description) {
                handleSearch(data.description);
              }
            }}
            query={{
              key: API_KEY,
              language: 'en',
            }}
            value={destinationText}
            onChangeText={(text: string) => setDestinationText(text)}
          />
        </View>
        <TouchableOpacity
          style={styles.currentLocationBox}
          onPress={requestLocationPermission}>
          <Icon
            style={styles.currentLocation}
            name="location-crosshairs"
            size={20}
          />
        </TouchableOpacity>
        <View style={styles.card}>
          <TextInput
            value={desiredDistance}
            onChangeText={handleDesiredDistanceChange}
            keyboardType="numeric"
            placeholder="Desired Distance (km)"
          />
          <Text> {currentCoords?.latitude} </Text>
          {distance !== null &&
            (isLoading ? (
              <Text> calculating distance </Text>
            ) : (
              <Text>{distance} </Text>
            ))}
          <Button
            title="Set Desired Distance"
            onPress={handleSetDesiredDistance}
          />
          <Button title="Turn Off Alarm" onPress={handleAlarmOff} />
        </View>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={currentCoords}>
          {currentCoords !== region && (
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  Container: {
    width: '100%',
    height: '100%',
  },
  currentLocation: {
    color: '#037ffc',
  },
  currentLocationBox: {
    width: 50,
    height: 50,
    zIndex: 100,
    backgroundColor: '#f2f0f0',
    position: 'absolute',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    right: 30,
    bottom: 200,
    borderRadius: 50,
    shadowColor: 'black',
    borderColor: '#dbd0d0',
    borderWidth: 1,
  },
  map: {
    height: '100%',
    marginVertical: 50,
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
    zIndex: 1,
  },
  card: {
    height: '20%',
    width: '100%',
    zIndex: 100,
    position: 'absolute',
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f0f0',
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
  },
});

export default App;
