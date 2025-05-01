import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { images } from '@/constants/images';
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut } from 'react-native-reanimated';
import * as SecureStore from "expo-secure-store";
import { router, useRouter } from 'expo-router';
import { icons } from '@/constants/icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchemaType, loginSchema } from '../../srcs/auth/validation';
import { user_login } from '../../srcs/auth/auth';
import { useAuth } from '@/srcs/auth/context/auth_context';

const Login = () => {
    const { login, session } = useAuth();
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginSchemaType>({
        resolver: zodResolver(loginSchema),
    });
    const [text, setText] = useState('');
    const [isPasswordVisbile, setIsPasswordVisible] = useState(true);
    const navigation = useRouter();

    const onSubmit = (data: LoginSchemaType) => {
        console.log('Form Data:', data);
    };

    const handleLogin = async () => {
        const response = await user_login({
            username: 'XD22',
            email: 'Johndoe22@gmail.com',
            password: 'admin',
        });

        if (response.success) {
            login(response.data.token);
        } else {

        }
    }
    useEffect(() => {
        if (session) {
            router.replace('/(tabs)');
        }
    }, [session]);

    return (
        <KeyboardAvoidingView
            className='flex-1'
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <View className='flex-1'>
                    <Image source={images.background} className='h-full absolute' />
                    {/* <ImageBackground source={images.background} style={{ height: "100%", flex: 1 }}> */}
                    <View className='flex-col h-full w-full justify-around pt-10 pb-10'>
                        <View className='flex-col items-start gap-5 p-11' >
                            {/* logo section */}
                            <Animated.Image
                                // entering={FadeInUp.delay(200).duration(1000).springify()}
                                source={images.logo}
                                className='self-center w-[250px] h-[250px] rounded-full mb-2'
                            />

                            {/* input section */}
                            <Animated.View
                                entering={FadeInDown.duration(1000).springify()} className='w-full'
                            >
                                <View className='flex-row justify-between'>
                                    <View className='flex-row gap-1 items-center p-1'>
                                        <Text className='font-bold text-xl'>Username or Email</Text>
                                        <Image source={icons.question_mark} className='w-[17px] h-[17px] color-red' />
                                    </View>
                                    {errors.identifier &&
                                        <Text className='color-red-500 self-center'>{errors.identifier.message}</Text>
                                    }
                                </View>
                                <View className={`flex-row justify-between items-center bg-white px-4 py-2 rounded-2xl w-full ${errors.identifier && 'border-red-400 border-[1.5px]'}`}>
                                    <Controller
                                        control={control}
                                        name="identifier"
                                        render={({ field: { onChange, value } }) => (
                                            <TextInput
                                                placeholder='example@gmail.com'
                                                placeholderTextColor={'#C9C9C9'}
                                                className='rounded-xl min-w-[80%]'
                                                onChangeText={onChange}
                                                value={value}
                                            />
                                        )}
                                    />
                                </View>
                            </Animated.View>
                            <Animated.View entering={FadeInDown.duration(1000).springify()} className='w-full'>
                                <View className='flex-row justify-between'>
                                    <View className='flex-row gap-1 items-center p-1'>
                                        <Text className='font-bold text-xl'>Password</Text>
                                        <Image source={icons.question_mark} className='w-[17px] h-[17px] color-red' />
                                    </View>
                                    {errors.password &&
                                        <Text className='color-red-500 self-center'>{errors.password.message}</Text>
                                    }
                                </View>
                                <View className={`flex-row justify-between items-center bg-white px-4 py-2 rounded-2xl w-full ${errors.password && 'border-red-400 border-[1.5px]'}`}>
                                    <Controller
                                        control={control}
                                        name="password"
                                        render={({ field: { onChange, value } }) => (
                                            <TextInput
                                                placeholder='password'
                                                placeholderTextColor={'#C9C9C9'}
                                                secureTextEntry={isPasswordVisbile}
                                                className='rounded-xl min-w-[80%]'
                                                onChangeText={onChange}
                                                value={value}
                                            />
                                        )}
                                    />
                                    <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisbile)}>
                                        <Image source={isPasswordVisbile ? icons.password_invisible : icons.password_visible} className='w-[25px] h-[25px]' />
                                    </TouchableOpacity>
                                </View>
                            </Animated.View>

                            {/* button section */}
                            <View className='self-center mt-12 items-center gap-5'>
                                <TouchableOpacity onPress={handleLogin}>
                                    <Animated.View
                                        entering={FadeInDown.delay(200).duration(1000).springify()}
                                        className='bg-[#1A736A] border-white border-2 rounded-xl py-3 px-[69px]'
                                    >
                                        <Text className='font-bold color-white'>Login</Text>
                                    </Animated.View>
                                </TouchableOpacity>
                                <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} className='flex-row justify-center'>
                                    <Text className='font-normal color-white text-[15px]'>Don't have an account? </Text>
                                    <TouchableOpacity onPress={() => navigation.push('/auth/signup')}>
                                        <Text className='font-medium text-[15px] color-[#48CAE4] underline'>Signup</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            </View>

                            {/* other option section  */}
                            <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} className='self-center items-center gap-4'>
                                <Text className='font-normal color-white text-[15px]'>___________________or___________________ </Text>
                                <TouchableOpacity>
                                    <Animated.View
                                        entering={FadeInDown.delay(800).duration(1000).springify()}
                                        className='bg-white border-black border-1 rounded-sm py-3 px-[90px]'
                                    >
                                        <View className='flex-row gap-[10px]'>
                                            <Image className='w-[20px] h-[20px]' source={icons.google} />
                                            <Text className='font-bold color-black'>Signup with Google</Text>
                                        </View>
                                    </Animated.View>
                                </TouchableOpacity>
                            </Animated.View>
                        </View>
                    </View>
                    {/* </ImageBackground > */}
                </View >
            </ScrollView>
        </KeyboardAvoidingView>
    )
}



export default Login