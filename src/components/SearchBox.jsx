import React from 'react';
import {View, StyleSheet} from 'react-native';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';

const SearchBox = ({
  destinationText,
  onDestinationTextChange,
  onPlaceSelect,
}) => {
  return (
    <View style={styles.searchBox}>
      <GooglePlacesAutocomplete
        placeholder="Search destination"
        onPress={(data, details = null) => {
          if (data.description) {
            onPlaceSelect(data.description);
          }
        }}
        query={{
          key: 'AIzaSyAx2KuYvnKN4fLS0A1IkqFlnBBCDHTmoWc',
          language: 'en',
        }}
        value={destinationText}
        onChangeText={onDestinationTextChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default SearchBox;
