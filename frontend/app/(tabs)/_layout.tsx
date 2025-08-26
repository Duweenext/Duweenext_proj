import React from 'react';
import { View, Text, ImageBackground, Image, Dimensions, PixelRatio } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { images } from '@/src/constants/images';
import { icons } from '@/src/constants/icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopBar from '@/src/component/NavBar/TopBar';
import BackgroundWrapper from '@/src/component/Layout/BackgroundWrapper';
import { theme } from '@/src/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const getResponsiveSize = (size: number) => {
    const scale = screenWidth / 320; 
    const newSize = size * scale;
    return Math.max(newSize, size * 0.9);
};

const responsiveMinWidth = Math.min(screenWidth * 0.80, 160);
const responsiveHeight = Math.min(screenHeight * 0.08, 300); 
const responsivePadding = getResponsiveSize(1);
const responsiveMarginTop = getResponsiveSize(14);

const responsiveTabBarHeight = Math.max(screenHeight * 0.08, 60);
const responsiveTabBarMargin = Math.max(screenWidth * 0.05, 20);
const responsiveTabBarMarginBottom = Math.max(screenHeight * 0.018, 1);

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
                    padding: responsivePadding,
                    width: responsiveMinWidth,
                    flex: 1,
                    minHeight: responsiveHeight,
                    maxHeight: responsiveHeight + 10, 
                    marginTop: responsiveMarginTop,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 12,
                    overflow: 'hidden',
                    flexDirection: 'column',
                }}
                imageStyle={{ 
                    borderRadius: 12,
                    resizeMode: 'stretch', 
                    position: 'absolute',
                    left: 0, 
                    top: 0,
                    width: '100%',
                    height: '100%'
                }}
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
                minWidth: responsiveMinWidth,
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: responsiveMarginTop + 2, // Slightly more margin for unfocused state
                borderRadius: 999,
                flexDirection: 'column',
                paddingHorizontal: 4, // Add some horizontal padding
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

const _Layout = () => {
    return (
        <BackgroundWrapper>
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
                        borderRadius: 25,
                        marginHorizontal: responsiveTabBarMargin,
                        marginBottom: responsiveTabBarMarginBottom,
                        paddingTop: 5,
                        height: 70,
                        position: 'absolute',
                        overflow: 'hidden',
                        borderWidth: 0,
                        elevation: 0,
                        shadowOpacity: 0, 
                        borderTopWidth: 0,
                        backdropFilter: 'blur(10px)',
                    },
                    sceneStyle: {
                        backgroundColor: theme.colors.white,
                    },
                }}
            >
            <Tabs.Screen
                name="index"
                options={{
                    title: '',
                    headerShown: true,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.home} title="Home" />
                    ),
                    header: () => <TopBar title="Home Page" showBackButton={false} />
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
            <Tabs.Screen
                name="(screens)"
                options={{
                    title: '',
                    headerShown: false,
                    href: null,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.educate} title="Screen" />
                    ),
                    // header: () => <TopBar title="Screen" />,
                }}
            />
        </Tabs>
        </BackgroundWrapper>
    );
};

export default _Layout;
