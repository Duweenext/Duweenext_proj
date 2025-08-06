import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import TextFieldPrimary from '@/component-v2/TextFields/TextFieldPrimary';
import TextFieldModal from '@/component-v2/TextFields/TextFieldModal';

const SplashScreen = () => {
  const navigation = useRouter();

  // States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [boardId, setBoardId] = useState('');

  return (
    <View className="w-full h-full p-10 flex items-center justify-center bg-white space-y-4">
      {/* Full Name Field with Validation */}
      <TextFieldPrimary
        name="Full Name"
        placeholder="John Doe"
        type="text"
        value={fullName}
        onChangeText={setFullName}
      />

      {/* Email Field with Validation */}
      <TextFieldPrimary
        name="Email"
        placeholder="you@example.com"
        type="email"
        value={email}
        onChangeText={setEmail}
      />

      {/* Password Field with strength indicator */}
      <TextFieldPrimary
        name="Password"
        placeholder="********"
        type="password"
        icon
        strengthIndicator
        value={password}
        onChangeText={setPassword}
      />

      {/* Board ID (Modal) Field */}
      <TextFieldModal
        name="Enter board ID"
        placeholder="Enter board ID"
        borderColor="#000000"
        textColor="#000000"
        value={boardId}
        onChangeText={setBoardId}
      />
    </View>
  );
};

export default SplashScreen;
