import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

const ButtonAddBoard: React.FC = () => {
  const handlePress = () => {
    console.log('Add board button pressed!');
    // Add your action here
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress} activeOpacity={0.8}>
      <Text style={styles.plus}>+</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 367,
    height: 95,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',

    // Shadow (iOS & Android)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  } as ViewStyle,
  plus: {
    fontSize: 48,
    color: '#000000',
    fontWeight: '400',
    lineHeight: 50,
  },
});

export default ButtonAddBoard;
