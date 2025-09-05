// app/(screens)/not-found.tsx  (or any path you prefer)
import React from 'react';
import { View, Image, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { themeStyle } from '@/src/theme';

const NEON = '#1A736A'; // bright neon mint-green you requested

export default function NotFoundScreen() {
  const { height, width } = Dimensions.get('window');
  const router = useRouter();

  // ⬇️ Fill these with your assets when ready
  const CIRCLE_IMG = require('@/assets/images/404.png');
  

  return (
   <>
   <View style={{
    flexDirection: 'column',
    alignContent: 'center', 
    alignItems: 'center',
    borderRadius: '100%',
    width: '100%'
   }}>
       <Image
        source={CIRCLE_IMG}
        style={{ width: 300, height: 400 }}
        resizeMode="contain"
        />
    </View>
    </>
  );
}
