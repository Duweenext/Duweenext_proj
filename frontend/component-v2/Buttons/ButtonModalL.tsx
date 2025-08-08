import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  GestureResponderEvent,
} from 'react-native';

interface ButtonModalLProps {
  text: string;
  filledColor?: string;
  textColor?: string;
  onPress?: (event: GestureResponderEvent) => void;
  marginBottom?: number;
}

const ButtonModalL: React.FC<ButtonModalLProps> = ({
  text,
  filledColor = '#FFFFFF',
  textColor = '#000000',
  onPress = () => { },
  marginBottom,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: filledColor,
          marginBottom: marginBottom ?? styles.button.marginVertical, // use prop if given
        },
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
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
    minWidth: 120,
  },
  text: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ButtonModalL;
