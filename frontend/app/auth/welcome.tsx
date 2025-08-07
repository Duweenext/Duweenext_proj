import React, { useState } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import TextFieldPrimary from '@/component-v2/TextFields/TextFieldPrimary';
import TextFieldModal from '@/component-v2/TextFields/TextFieldModal';
import TextFieldSensorValue from '@/component-v2/TextFields/TextFieldSensorValue';
import TextFieldVerificationCode from '@/component-v2/TextFields/TextFieldVerificationCode';
import ButtonPrimary from '@/component-v2/Buttons/ButtonPrimary';
import ButtonModalL from '@/component-v2/Buttons/ButtonModalL';
import ButtonModalXL from '@/component-v2/Buttons/ButtonModalXL';
import ButtonCard from '@/component-v2/Buttons/ButtonCard';
import ButtonGoogle from '@/component-v2/Buttons/ButtonGoogle';
import ButtonUnderline from '@/component-v2/Buttons/ButtonUnderline';

const SplashScreen = () => {
  const navigation = useRouter();
  const { height: screenHeight } = useWindowDimensions();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [boardId, setBoardId] = useState('');
  const [minThreshold, setMinThreshold] = useState('6.5');
  const [maxThreshold, setMaxThreshold] = useState('28');
  const [hasError, setHasError] = useState(false); // ✅ define once

  const handleCodeFilled = (code: string) => {
    console.log('Verification Code:', code);
    const correctCode = '123456';
    setHasError(code !== correctCode);
  };

  return (
    <ScrollView
      contentContainerStyle={{
        minHeight: screenHeight,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
      }}
    >
   <View style={{ padding: 20 }}>
      <ButtonUnderline
        text="Learn more"
        onPress={() => console.log('Learn more tapped')}
      />
      <ButtonUnderline
        text="register"
        onPress={() => console.log('Register tapped')}
      />
    </View>
    </ScrollView>
  );
};

export default SplashScreen;
