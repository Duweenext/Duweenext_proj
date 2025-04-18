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
                className='flex flex-row w-full flex-1 min-w-[70px] min-h-[70px] mt-2 justify-center items-center rounded-full overflow-hidden'
                tintColor='#087979'
            >
                <Image source={icon} tintColor="#ffffff" className='size-8 mb-2' />
            </ImageBackground>
        )
    }
    else {
        return (
            <View className='size-full justify-center items-center mt-4 rounded-full'>
                <Image
                    source={icon}
                    tintColor="#A8B5DB"
                    className='size-8 mb-2'
                />
            </View>
        )
    }
}

const CustomHeader = ({ title }: { title: string }) => {
    return (
        <View className="py-6 px-6 bg-[#95E7E7]">
            <Text className='text-start font-bold text-[#1A736A] text-2xl' >
                {title}
            </Text>
        </View>
    );
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
                    backgroundColor: '#95E7E7',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    minHeight: 60,
                    position: 'absolute',
                },
                tabBarActiveTintColor: '#fff', // color when tab is active
                tabBarInactiveTintColor: '#fff',
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
                        ),
                        header: () => <CustomHeader title='Education' />
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
                        ),
                        header: () => <CustomHeader title='Home' />
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
                        ),
                        header: () => <CustomHeader title='Setting' />
                    }
                }
            />

        </Tabs>
    )
}

export default _Layout