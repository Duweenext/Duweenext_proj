import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  GestureResponderEvent,
  View,
  Image,
  ViewStyle,
} from 'react-native';

interface ButtonGoogleProps {
  text: string;
  borderColor?: string;
  width?: number | string;
  onPress?: (event: GestureResponderEvent) => void;
}

const ButtonGoogle: React.FC<ButtonGoogleProps> = ({
  text,
  borderColor = '#000000',
  width = '100%',
  onPress = () => {},
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          borderColor,
          width,
        } as ViewStyle, // ✅ Fix underline issue here
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.content}>
        <Image
          source={require('@/assets/icons/google.png')}
          style={styles.googleIcon}
        />
        <Text style={styles.text}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderRadius: 8,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginVertical: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  text: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
});

export default ButtonGoogle;
