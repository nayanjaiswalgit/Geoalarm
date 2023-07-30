import React from 'react';
import {View, Text, TextInput, Button, StyleSheet} from 'react-native';

const Card = ({currentCoords, distance, handleAlarmOff}) => {
  return (
    <View style={styles.card}>
      <Text>Start</Text>
      <TextInput>Meters</TextInput>
      <Text>{currentCoords?.latitude}</Text>
      {distance !== null && (
        <Text>Distance to Destination: {distance} kilometers</Text>
      )}
      <Button title="Right button" onPress={() => handleAlarmOff()} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    height: '20%',
    width: '100%',
    zIndex: 100,
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#f2f0f0',
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
  },
});

export default Card;
