import React, { useEffect, useRef } from 'react'; // 1. Import useEffect and useRef
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native'; // Keep this import
import { theme } from '@/src/theme';

interface SuccessToastProps {
  text1?: string;
  text2?: string;
}

const SuccessToast: React.FC<SuccessToastProps> = ({ text1, text2 }) => {
  // 2. Create a ref to hold a reference to the LottieView component
  const animationRef = useRef<LottieView>(null);

  // 3. Use useEffect to play the animation whenever the component appears
  useEffect(() => {
    // The `play` method can take a start and end frame.
    // Calling play(0) is a clean way to force it to play from the beginning.
    animationRef.current?.play(0);
  }, [text1, text2]); // Dependency array ensures this runs when the text changes

  return (
    <View style={styles.container}>
      <LottieView
        ref={animationRef} // 4. Assign the ref to the LottieView
        source={require('@/assets/animations/Success.json')}
        loop={false} // `loop` is still false, which is correct
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

// ... styles remain the same
const styles = StyleSheet.create({
  container: {
    minHeight: 80,
    width: '90%',
    backgroundColor: '#FFF',
    borderColor: '#065F46',
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
  },
  bodyText: {
    fontSize: 15,
    fontFamily: theme.fontFamily.regular,
  },
});

export default SuccessToast;