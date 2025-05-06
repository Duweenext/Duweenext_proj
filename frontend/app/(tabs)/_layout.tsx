import { View, Text, ImageBackground, Image, Platform } from 'react-native'
import React from 'react'
import { Redirect, Tabs } from 'expo-router'
import { images } from '@/constants/images'
import { icons } from '@/constants/icons'
import { useAuth } from '@/srcs/auth/context/auth_context'
import { SafeAreaView } from 'react-native-safe-area-context'

function TabIcon({ focused, icon, title }: any) {
    if (focused) {
        return (
            <ImageBackground
                source={images.highlight}
                className="flex p-3 w-full flex-1 min-w-[120px] min-h-16 mt-3.5 justify-center items-center rounded-xl overflow-hidden"
            >
                <Image source={icon} tintColor="#fff" className="size-6" />
                <Text className="text-white text-sm font-semibold ml-2">
                    {title}
                </Text>
            </ImageBackground>
        );
    }

    return (
        <View className=" min-w-[120px] size-full justify-center items-center mt-4 rounded-full">
            <Image source={icon} tintColor="#A8B5DB" className="size-7" />
            <Text className="text-black text-sm font-semibold ml-2">
                {title}
            </Text>
        </View>
    );
}

const CustomHeader = ({ title }: { title: string }) => {
    return (
        <SafeAreaView>
            <View className="py-6 px-6 bg-[#95E7E7]">
                <Text className='text-start font-bold text-[#1A736A] text-2xl' >
                    {title}
                </Text>
            </View>
        </SafeAreaView>
    );
}

const _Layout = () => {
    const { session, isLoading } = useAuth();

    if (isLoading) {
        return <Text>Loading...</Text>;
    }

    // if (!session) {
    //     return <Redirect href="/auth/welcome" />;
    // }
    return (
        <Tabs
            screenOptions={{
                tabBarItemStyle: {
                    width: "100%",
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                },
                tabBarStyle: {
                    backgroundColor: "#fff",
                    borderRadius: 15,
                    marginHorizontal: 20,
                    marginBottom: 60,
                    paddingTop: 5,
                    height: 60,
                    position: "absolute",
                    overflow: "hidden",
                    borderWidth: 1,
                    elevation: 0, // Android shadow
                    shadowOpacity: 0, // iOS shadow
                    borderTopWidth: 0,
                },
            }}
        >
            <Tabs.Screen
                name='education'
                options={
                    {
                        title: '',
                        headerShown: true,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon
                                focused={focused}
                                icon={icons.educate}
                                title='Education'
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
                        title: '',
                        headerShown: true,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon
                                focused={focused}
                                icon={icons.home}
                                title='Home'
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
                        title: '',
                        headerShown: true,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon
                                focused={focused}
                                icon={icons.setting}
                                title='Setting'
                            />
                        ),
                        header: () => <CustomHeader title='Setting' />
                    }
                }
            />
            <Tabs.Screen
                name="sensor/[id]"
                options={{
                    href: null,
                    header: () => <CustomHeader title='Setting' />
                }}
            />


        </Tabs>
    )
}

export default _Layout