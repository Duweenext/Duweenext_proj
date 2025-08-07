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
import DropDownTemplate from '@/component-v2/Dropdown/DropDownTemplate';
import TopBar from '@/component-v2/NavBar/TopBar';
import ButtonAddBoard from '@/component-v2/Buttons/ButtonAddBoard';
import ModalVerificationComplete from '@/component-v2/Modals/ModalVerificationComplete';
import CardIcon from '@/component-v2/Card/CardIcon';

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
        backgroundColor: 'black',
      }}
    >
    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
      <CardIcon
        icon={require('../../assets/images/camera.png')}
        onPress={() => console.log('Camera')}
      />
      <CardIcon
        icon={require('../../assets/images/upload.png')}
        onPress={() => console.log('Upload')}
      />
      <CardIcon
        icon={require('../../assets/images/share.png')}
        onPress={() => console.log('Share')}
      />
    </View>
    </ScrollView>
  );
};

export default SplashScreen;
