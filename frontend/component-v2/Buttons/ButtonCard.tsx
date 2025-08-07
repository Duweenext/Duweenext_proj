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
  textColor?: string;
  onPress?: (event: GestureResponderEvent) => void;
}

const ButtonCard: React.FC<ButtonCardProps> = ({
  text,
  filledColor = '#000000',
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
    width: 97,
    height: 26,
    borderRadius: 5,
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
