import React from 'react';
import {theme} from '@/theme';
import {
  TouchableOpacity,
  StyleSheet,
  Image,
  GestureResponderEvent,
} from 'react-native';

const ButtonCamera: React.FC = () => {
  const handlePress = (event: GestureResponderEvent) => {
    console.log('Camera button pressed');
    // Your camera launch logic here
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress} activeOpacity={0.8}>
      <Image
        source={require('@/assets/images/camera.png')} 
        style={styles.icon}
      />
    </TouchableOpacity>
  );
};

const SIZE = 35; // You can change to any fixed value if needed

const styles = StyleSheet.create({
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  icon: {
    width: SIZE * 0.65,
    height: SIZE * 0.65,
    resizeMode: 'contain',
    tintColor: theme.colors.primary, 
  },
});

export default ButtonCamera;
