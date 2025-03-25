import { View, Text, ImageBackground, Image } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import { images } from '@/constants/images'
import { icons } from '@/constants/icons'

const TabIcon = ({ focused, icon }: any) => {

    if (focused) {
        return (
            <ImageBackground
                source={images.highlight}
                className='flex flex-row w-full flex-1 min-w-[70px] min-h-[70px] justify-center items-center rounded-full overflow-hidden'
                tintColor='#087979'
            >
                <Image source={icon} tintColor="#151312" className='size-5' />
            </ImageBackground>
        )
    }
    else {
        return (
            <View className='size-full justify-center items-center mt-4 rounded-full'>
                <Image
                    source={icon}
                    tintColor="#A8B5DB"
                    className='size-5'
                />
            </View>
        )
    }
}

const _Layout = () => {
    return (
        <Tabs
            screenOptions={{
                tabBarItemStyle: {
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                },
                tabBarStyle: {
                    backgroundColor: '#0f0D23',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    minHeight: 70,
                    position: 'absolute',
                    borderWidth: 1,
                    borderColor: '0f0d23'
                },
            }}
        >
            <Tabs.Screen
                name='education'
                options={
                    {
                        title: 'Education',
                        headerShown: true,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon
                                focused={focused}
                                icon={icons.educate}
                            />
                        )
                    }
                }
            />
            <Tabs.Screen
                name='index'
                options={
                    {
                        title: 'Home',
                        headerShown: true,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon
                                focused={focused}
                                icon={icons.home}
                            />
                        )
                    }
                }
            />
            <Tabs.Screen
                name='setting'
                options={
                    {
                        title: 'Setting',
                        headerShown: true,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon
                                focused={focused}
                                icon={icons.setting}
                            />
                        )
                    }
                }
            />
        </Tabs>
    )
}

export default _Layout