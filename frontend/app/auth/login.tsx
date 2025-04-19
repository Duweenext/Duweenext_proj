import { View, Text, Image, TextInput, ImageBackground, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { images } from '@/constants/images';
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import style from './authstyle';
import { icons } from '@/constants/icons';

const Login = () => {
    const [text, setText] = useState('');
    const [isPasswordVisbile, setIsPasswordVisible] = useState(true);
    const navigation = useRouter();

    return (
        <View style={{ flex: 1 }}>
            <ImageBackground source={images.background} style={{ height: "100%", flex: 1 }}>
                <View style={style.outerbox}>
                    <View style={style.innerbox} >
                        {/* logo section */}
                        <Animated.Image entering={FadeInUp.delay(200).duration(1000).springify()} source={images.highlight} style={style.logo_section} />

                        {/* input section */}
                        <View style={style.input_section}>
                            <Animated.Text entering={FadeInDown.duration(1000).springify()} style={style.input_header}>Username or Email</Animated.Text>
                            <Animated.View entering={FadeInDown.duration(1000).springify()} style={style.text_input_box}>
                                <TextInput placeholder='example@gmail.com' placeholderTextColor={'#C9C9C9'} />
                            </Animated.View>
                        </View>
                        <View style={style.input_section}>
                            <Animated.Text entering={FadeInDown.duration(1000).springify()} style={style.input_header}>Password</Animated.Text>
                            <Animated.View entering={FadeInDown.duration(1000).springify()} style={style.text_input_box}>
                                <TextInput placeholder='password' placeholderTextColor={'#C9C9C9'} secureTextEntry={isPasswordVisbile} />
                                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisbile)}>
                                    <Image source={isPasswordVisbile ? icons.password_invisible : icons.password_visible} style={style.password_visibility_toggle} />
                                </TouchableOpacity>
                            </Animated.View>
                        </View>

                        {/* button section */}
                        <View style={style.button_section}>
                            <TouchableOpacity>
                                <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} style={style.login_button}>
                                    <Text style={style.login_button_text}>Login</Text>
                                </Animated.View>
                            </TouchableOpacity>
                            <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={style.register_text_section}>
                                <Text style={style.warning_text}>Don't have an account? </Text>
                                <TouchableOpacity onPress={() => navigation.push('/auth/signup')}>
                                    <Text style={style.register_text_link}>Signup</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        </View>

                        {/* other option section  */}
                        <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} style={style.other_option_section}>
                            <Text style={style.warning_text}>___________________or___________________ </Text>
                            <TouchableOpacity>
                                <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()} style={style.google_button}>
                                    <View style={style.google_button_content_section}>
                                        <Image style={style.google_image} source={icons.google} />
                                        <Text style={style.google_text}>Signup with Google</Text>
                                    </View>
                                </Animated.View>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </View>
            </ImageBackground >
        </View >
    )
}



export default Login