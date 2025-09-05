import { images } from "@/src/constants/images";
import React from "react";
import { ImageBackground, Image, Text, View } from "react-native";

export const TabIcon = ({
    focused,
    icon,
    title,
}: {
    focused: boolean;
    icon: any;
    title: string;
}) => {
    if (focused) {
        return (
            <ImageBackground
                source={images.highlight}
                style={{
                    padding: 16, // p-3
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