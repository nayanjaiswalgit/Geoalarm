import React from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';

const CurrentLocationButton = ({onPress}) => {
  return (
    <TouchableOpacity style={styles.currentLocationBox} onPress={onPress}>
      <Icon
        style={styles.currentLocation}
        name="location-crosshairs"
        size={20}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
});

export default CurrentLocationButton;
