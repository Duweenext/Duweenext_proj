import React from 'react';
import { View, Text, ImageBackground, Image } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { images } from '@/constants/images';
import { icons } from '@/constants/icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopBar from '@/component-v2/NavBar/TopBar';

function TabIcon({
    focused,
    icon,
    title,
}: {
    focused: boolean;
    icon: any;
    title: string;
}) {
    if (focused) {
        return (
            <ImageBackground
                source={images.highlight}
                style={{
                    padding: 12, // p-3
                    width: '100%',
                    flex: 1,
                    minWidth: 120, // min-w-[120px]
                    minHeight: 64, // min-h-16
                    marginTop: 14, // mt-3.5
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 12, // rounded-xl
                    overflow: 'hidden',
                    flexDirection: 'column',
                }}
                imageStyle={{ borderRadius: 12 }}
            >
                <Image
                    source={icon}
                    style={{ width: 24, height: 24, tintColor: '#fff' }} // size-6 & tint
                />
                <Text
                    style={{
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: '600',
                        marginLeft: 8,
                    }}
                >
                    {title}
                </Text>
            </ImageBackground>
        );
    }

    return (
        <View
            style={{
                minWidth: 120, // min-w-[120px]
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 16, // mt-4
                borderRadius: 999, // rounded-full
                flexDirection: 'column',
            }}
        >
            <Image
                source={icon}
                style={{ width: 28, height: 28, tintColor: '#A8B5DB' }} // size-7 & tint
            />
            <Text
                style={{
                    color: '#000',
                    fontSize: 14,
                    fontWeight: '600',
                    marginLeft: 8,
                }}
            >
                {title}
            </Text>
        </View>
    );
}

const CustomHeader = ({ title }: { title: string }) => {
    return (
        <SafeAreaView>
            <View
                style={{
                    paddingVertical: 24, // py-6
                    paddingHorizontal: 24, // px-6
                    backgroundColor: 'rgba(149, 231, 231, 0.85)',
                }}
            >
                <Text
                    style={{
                        textAlign: 'left',
                        fontWeight: '700',
                        color: '#1A736A',
                        fontSize: 24, // text-2xl
                    }}
                >
                    {title}
                </Text>
            </View>
        </SafeAreaView>
    );
};

const _Layout = () => {
    return (
        <Tabs
            screenOptions={{
                tabBarItemStyle: {
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                },
                tabBarStyle: {
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    borderRadius: 15,
                    marginHorizontal: 20,
                    marginBottom: 60,
                    paddingTop: 5,
                    height: 60,
                    position: 'absolute',
                    overflow: 'hidden',
                    borderWidth: 0,
                    elevation: 0, // Android shadow off
                    shadowOpacity: 0, // iOS shadow off
                    borderTopWidth: 0,
                    backdropFilter: 'blur(10px)', // iOS blur effect
                },
                headerStyle: {
                    backgroundColor: 'transparent',
                },
                sceneStyle: {
                    backgroundColor: 'transparent',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: '',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.home} title="Home" />
                    ),
                    header: () => <TopBar title = "Home Page" />
                }}
            />
            <Tabs.Screen
                name="education"
                options={{
                    title: '',
                    headerShown: true,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.educate} title="Education" />
                    ),
                    header: () => <TopBar title="Education" />,
                }}
            />
            <Tabs.Screen
                name="sensor"
                options={{
                    title: '',
                    headerShown: true,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.sensor} title="Sensor" />
                    ),
                    header: () => <TopBar title="Sensor" />,
                }}
            />
            <Tabs.Screen
                name="setting"
                options={{
                    title: '',
                    headerShown: true,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.setting} title="Setting" />
                    ),
                    header: () => <TopBar title="Setting" />,
                }}
            />
        </Tabs>
    );
};

export default _Layout;
