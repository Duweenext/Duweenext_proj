import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import { images } from '@/constants/images';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Button } from '@/components/ui/button';
import { CardBoardModal } from '@/component-v2/Card/CardBoardModal';
import CardBoardPrimary from '@/component-v2/Card/CardBoardPrimary';

const SplashScreen = () => {
    const navigation = useRouter();

    return (
        <div className='w-full h-full p-4 flex items-center justify-center bg-[#02c39a]'>
            <CardBoardPrimary
                mode="disconnected"
                lastConnected='05 April 2024 11:09 PM'
                runningTime="45 hours 32 minutes"
                onCardPress={() => {}}
                onButtonPress={() => {}}
            />
        </div>
    )
}

export default SplashScreen