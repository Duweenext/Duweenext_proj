import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import { images } from '@/constants/images';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const SplashScreen = () => {
    const navigation = useRouter();

    return (
        <View className='flex-1'>
            <Image source={images.background} className='h-full absolute' />
            {/* logo section */}
            <View className='flex-col h-full w-full justify-around '>
                <View className='flex-col items-start gap-5 px-11 py-5' >
                    {/* logo section  */}
                    <Animated.Image entering={FadeInUp.delay(200).duration(1000).springify()} source={images.highlight} className='self-center w-[250px] h-[250px] rounded-full mb-2' />

                    {/* Quote section  */}
                    <View className='items-center w-full mt-9 mb-[80px]'>
                        <Text className='text-5xl font-medium'>Duweenext</Text>
                        <Text className='text-[15px] color-white'>Monitor, Prevent & Thrive!</Text>
                    </View>

                    {/* button section  */}
                    <View className='self-center mt-12 items-center gap-5'>
                        <TouchableOpacity onPress={() => navigation.push('/auth/signup')}>
                            <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()}
                                className='bg-[#1A736A] border-white border-2 rounded-xl py-3 px-[60px]'
                            >
                                <Text className='font-bold color-white underline'>Register</Text>
                            </Animated.View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.push('/auth/login')}>
                            <Animated.View
                                entering={FadeInDown.delay(400).duration(1000).springify()}
                                className='bg-white border-black border-[1px] rounded-lg py-3 px-[69px]'
                            >
                                <Text className='text-[15px] font-bold color-[#1A736A]'>Login</Text>
                            </Animated.View>
                        </TouchableOpacity>
                        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} className='flex-row justify-center'>
                            <Text className='font-normal color-white text-[15px]'>Please login if you have already registered.</Text>
                        </Animated.View>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default SplashScreen