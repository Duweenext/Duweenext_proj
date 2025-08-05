import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { images } from '@/constants/images';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Button } from '@/components/ui/button';
import TextFieldPrimary from '@/component-v2/TextFields/TextFieldPrimary';
import TextFieldModal from '@/component-v2/TextFields/TextFieldModal';

const SplashScreen = () => {
  const navigation = useRouter();

  // Declare state for the text field
     //const [fullName, setFullName] = useState('');
    // const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // const [fullName, setFullName] = useState('');
    const [input, setInput] = useState('');


  return (
    <View className="w-full h-full p-10 flex items-center justify-center bg-white">
      <TextFieldPrimary
        // name="Fullname"
        // placeholder="John Doe"
        // type="text"
        // value={fullName}
        // onChangeText={setFullName}
        //  <TextFieldPrimary
        //   name="Email"
        //   placeholder="you@example.com"
        //   type="email"
        //   value={email}
        //   onChangeText={setEmail}
        // />

        // <TextFieldPrimary
          name="Password"
          placeholder="********"
          type="password"
          icon
          strengthIndicator
          value={password}
          onChangeText={setPassword}
        // />

        // <TextFieldPrimary
        //   name="Full Name"
        //   placeholder="John Doe"
        //   type="text"
        //   value={fullName}
        //   onChangeText={setFullName}
        // />

      />

      <TextFieldModal
        name="Enter board ID"
        placeholder="Enter board ID"
        borderColor="#000000"
        textColor="#000000"
        value={input}
        onChangeText={setInput}
      />
    </View>
  );
};

export default SplashScreen;
