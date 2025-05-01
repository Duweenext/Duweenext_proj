
import { View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { images } from '@/constants/images';
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut, useSharedValue, useAnimatedStyle, withTiming, FadeOutDown, FadeInRight, FadeOutRight, } from 'react-native-reanimated';
import { router, useRouter } from 'expo-router';
import { icons } from '@/constants/icons';
import { useForm, Controller } from 'react-hook-form';
import { signUpSchema, SignUpSchemaType } from '../../srcs/auth/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { getPasswordStrength } from '../../srcs/utlis/passwordStrength';
import { user_register } from '../../srcs/auth/auth';
import { useAuth } from '@/srcs/auth/context/auth_context';

const SingUp = () => {
    const { login, session } = useAuth();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<SignUpSchemaType>({
        resolver: zodResolver(signUpSchema),
    });
    const [password, setPassword] = useState('');
    const passwordStrength = getPasswordStrength(password);

    const [isPasswordVisbile, setIsPasswordVisible] = useState(true);
    const navigation = useRouter();

    const onSubmit = (data: SignUpSchemaType) => {
        console.log('Form Data:', data);
    };

    const handleRegister = async () => {
        const response = await user_register({
            username: 'Hello_test23',
            email: 'Johndoe32_notest@gmail.com',
            password: 'admin',
        });

        if (response.success) {
            login(response.data.token);
        } else {

        }
    }

    const strengthBarWidth = useSharedValue(0);

    useEffect(() => {
        if (passwordStrength === 'Strong') {
            strengthBarWidth.value = withTiming(220, { duration: 300 });
        } else if (passwordStrength === 'Medium') {
            strengthBarWidth.value = withTiming(150, { duration: 300 });
        } else {
            strengthBarWidth.value = withTiming(60, { duration: 300 });
        }

        if (session) {
            router.replace('/(tabs)');
        }
    }, [passwordStrength, session]);

    const animatedBarStyle = useAnimatedStyle(() => ({
        width: strengthBarWidth.value,
    }));


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
                    <View className='flex-col h-full w-full justify-around '>
                        <View className='flex-col items-start gap-5 px-11 py-5' >
                            {/* logo section */}
                            <Animated.Image
                                entering={FadeInUp.delay(200).duration(1000).springify()}
                                source={images.logo}
                                className='self-center w-[250px] h-[250px] rounded-full mb-2'
                            />

                            {/* input section */}
                            <Animated.View entering={FadeInDown.duration(1000).springify()} className='w-full'>
                                <View className='flex-row justify-between items-center'>
                                    <View className='flex-row gap-1 items-center p-1'>
                                        <Text className='font-bold text-xl'>Username</Text>
                                        <Image source={icons.question_mark} className='w-[17px] h-[17px] color-red' />
                                    </View>
                                    {errors.username &&
                                        <Text className='color-red-500 self-center'>{errors.username.message}</Text>
                                    }
                                </View>
                                <View className={`flex-row justify-between items-center bg-white px-4 py-2 rounded-2xl w-full ${errors.username && 'border-red-400 border-[1.5px]'}`}>
                                    <Controller
                                        control={control}
                                        name="username"
                                        render={({ field: { onChange, value } }) => (
                                            <TextInput
                                                placeholder='John Doe'
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
                                        <Text className='font-bold text-xl'>Email</Text>
                                        <Image source={icons.question_mark} className='w-[17px] h-[17px] color-red' />
                                    </View>
                                    {errors.email &&
                                        <Text className='color-red-500 self-center'>{errors.email.message}</Text>
                                    }
                                </View>
                                <View className={`flex-row justify-between items-center bg-white px-4 py-2 rounded-2xl w-full ${errors.email && 'border-red-400 border-[1.5px]'}`}>
                                    <Controller
                                        control={control}
                                        name="email"
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
                                                onChangeText={(text) => {
                                                    setPassword(text);      // local state for strength
                                                    onChange(text);         // form state for zod + validation
                                                }}
                                                value={value}
                                            />
                                        )}
                                    />

                                    <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisbile)}>
                                        <Image source={isPasswordVisbile ? icons.password_invisible : icons.password_visible} className='w-[25px] h-[25px]' />
                                    </TouchableOpacity>
                                </View>

                                {password &&
                                    <Animated.View
                                        entering={FadeInRight.delay(200).duration(400).springify()}
                                        exiting={FadeOutRight.delay(50).duration(400).springify()}
                                        className="mt-1 mx-1 flex-row justify-between"
                                    >
                                        <View className="h-[8px] rounded-full bg-gray-300 mt-2 overflow-hidden">
                                            <Animated.View
                                                style={animatedBarStyle}
                                                className={`h-full ${passwordStrength === 'Strong'
                                                    ? 'bg-good'
                                                    : passwordStrength === 'Medium'
                                                        ? 'bg-warning'
                                                        : 'bg-failed'
                                                    }`}
                                            />
                                        </View>
                                        <Text
                                            className={
                                                `text-lg font-medium ${passwordStrength === 'Strong'
                                                    ? 'text-good'
                                                    : passwordStrength === 'Medium'
                                                        ? 'text-warning'
                                                        : 'text-failed'}`
                                            }
                                        >
                                            {passwordStrength}
                                        </Text>
                                    </Animated.View>}
                            </Animated.View>

                            {/* button section */}
                            <View className='self-center mt-2 items-center gap-5'>
                                <TouchableOpacity onPress={handleRegister}>
                                    <Animated.View
                                        entering={FadeInDown.delay(400).duration(1000).springify()}
                                        className='bg-[#1A736A] border-white border-2 rounded-xl py-3 px-[60px]'
                                    >
                                        <Text className='font-bold color-white'>Register</Text>
                                    </Animated.View>
                                </TouchableOpacity>
                                <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} className='flex-row justify-center'>
                                    <Text className='font-normal color-white text-[15px]'>Already have an account? </Text>
                                    <TouchableOpacity onPress={() => navigation.push('/auth/login')}>
                                        <Text className='font-medium text-[15px] color-[#48CAE4] underline'>Login</Text>
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
                </View >
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default SingUp