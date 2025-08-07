import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  GestureResponderEvent,
} from 'react-native';

interface ButtonModalXLProps {
  text: string;
  filledColor?: string;
  textColor?: string;
  onPress?: (event: GestureResponderEvent) => void;
}

const ButtonModalXL: React.FC<ButtonModalXLProps> = ({
  text,
  filledColor = '#227C71', // default green like in your design
  textColor = '#FFFFFF',
  onPress = () => {},
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: filledColor },
      ]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 261,
    height:49,
    minHeight: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 10,

    // Optional elevation / shadow
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ButtonModalXL;
