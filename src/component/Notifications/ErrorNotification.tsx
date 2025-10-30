import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { theme } from '@/src/theme';

interface ErrorToastProps {
  text1?: string;
  text2?: string;
}

const ErrorToastNotification: React.FC<ErrorToastProps> = ({ text1, text2 }) => {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    animationRef.current?.play(0);
  }, [text1, text2]);

  return (
    <View style={styles.container}>
      <LottieView
        ref={animationRef}
        source={require('@/assets/animations/error.json')} // Using the new error animation
        loop={false}
        style={styles.lottie}
        duration={2000}
      />
      <View style={styles.textContainer}>
        {text1 && <Text style={styles.titleText}>{text1}</Text>}
        {text2 && <Text style={styles.bodyText}>{text2}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // A red-themed style for error messages
  container: {
    minHeight: 80,
    width: '90%',
    backgroundColor: '#FEE2E2', // A light red background
    borderColor: '#991B1B', // A dark red border
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  lottie: {
    width: 45,
    height: 45,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 18,
    fontFamily: theme.fontFamily.medium,
    color: '#991B1B', // Dark red text
  },
  bodyText: {
    fontSize: 15,
    fontFamily: theme.fontFamily.regular,
    color: '#B91C1C', // Slightly lighter red text
  },
});

export default ErrorToastNotification;