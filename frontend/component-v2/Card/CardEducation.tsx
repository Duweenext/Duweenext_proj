// components/card/CardEducation.tsx
import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ViewStyle,
  Platform,
} from 'react-native';
import { themeStyle } from '../../src/theme';

type Props = {
  title: string;
  icon: any;               // require('...png') or { uri }
  onPress?: () => void;
  style?: ViewStyle;
};

const CardEducation: React.FC<Props> = ({ title, icon, onPress, style }) => {
  const Container = onPress ? Pressable : View;

  // inline base styles
  const baseCardStyle: ViewStyle = {
    backgroundColor: themeStyle.colors.white,
    borderWidth: 1,
    borderColor: themeStyle.colors.primary,
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'flex-start',
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
        }
      : { elevation: 2 }),
  };

  return (
    <Container style={[baseCardStyle, style]} onPress={onPress}>
      <View style={{ marginBottom: 12 }}>
        <Image
          source={icon}
          style={{ width: 72, height: 72, resizeMode: 'contain' }}
        />
      </View>

      <Text
        style={{
          textAlign: 'center',
          fontSize: themeStyle.fontSize.description,
          fontFamily: themeStyle.fontFamily.medium,
          color: themeStyle.colors.black,
        }}
      >
        {title}
      </Text>
    </Container>
  );
};

export default CardEducation;
