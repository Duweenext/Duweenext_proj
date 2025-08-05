import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import { images } from '@/constants/images';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Button } from '@/components/ui/button';

const SplashScreen = () => {
    const navigation = useRouter();

    return (
        <>
            <Button>Div</Button>
        </>
    )
}

export default SplashScreen