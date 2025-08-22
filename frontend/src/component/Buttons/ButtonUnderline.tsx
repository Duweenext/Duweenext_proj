import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  GestureResponderEvent,
} from 'react-native';

interface ButtonUnderlineProps {
  text: string;
  onPress?: (event: GestureResponderEvent) => void;
}

const ButtonUnderline: React.FC<ButtonUnderlineProps> = ({
  text,
  onPress = () => {},
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  text: {
    color: '#30C6E1', // Constant color
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    marginVertical: 4,
  },
});

export default ButtonUnderline;
