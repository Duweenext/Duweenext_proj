import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  GestureResponderEvent,
  Image,
  ImageSourcePropType,
} from 'react-native';

interface CardIconProps {
  icon: ImageSourcePropType;
  onPress?: (event: GestureResponderEvent) => void;
}

const CardIcon: React.FC<CardIconProps> = ({
  icon,
  onPress = () => {},
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image source={icon} style={styles.icon} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 50,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#227C71',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 6,
  },
  icon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
    tintColor: '#000000', // optional: force black icon
  },
});

export default CardIcon;
