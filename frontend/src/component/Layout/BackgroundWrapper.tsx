import { images } from '@/src/constants/images';
import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

interface BackgroundWrapperProps {
  children: React.ReactNode;
}

const BackgroundWrapper: React.FC<BackgroundWrapperProps> = ({ children }) => {
  return (
    <ImageBackground
      source={images.background}
      style={styles.background}
      imageStyle={{ 
        resizeMode: 'cover' // Change from 'contain' to 'cover'
      }}
    >
      {children}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default BackgroundWrapper;
