import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  GestureResponderEvent,
} from 'react-native';

interface ButtonCardProps {
  text: string;
  filledColor?: string;
  borderColor?: string;
  textColor?: string;
  width?: number;
  height?: number;
  onPress?: (event: GestureResponderEvent) => void;
  round?: number;
}

const ButtonCard: React.FC<ButtonCardProps> = ({
  text,
  filledColor = '#000000',
  borderColor,
  width = 97,
  height = 26,
  textColor = '#FFFFFF',
  onPress = () => {},
  round = 5,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { 
          backgroundColor: filledColor, 
          borderRadius: round, 
          borderWidth: 1, 
          borderColor: borderColor ? borderColor : 'transparent',
          width: width,
          height: height,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ButtonCard;
