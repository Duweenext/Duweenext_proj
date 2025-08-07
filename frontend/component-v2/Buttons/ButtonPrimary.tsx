import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  GestureResponderEvent,
  ViewStyle,
} from 'react-native';

interface ButtonPrimaryProps {
  text: string;
  filledColor?: string;
  borderColor?: string;
  textColor?: string;
  onPress?: (event: GestureResponderEvent) => void;
}

const ButtonPrimary: React.FC<ButtonPrimaryProps> = ({
  text,
  filledColor = '#FFFFFF',       // Default: white
  borderColor = '#000000',        // Default: black
  textColor = '#000000',          // Default: black
  onPress = () => {},
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: filledColor,
          borderColor: borderColor,
        },
      ]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ButtonPrimary;
