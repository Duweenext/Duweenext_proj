import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'

interface Props {
    title: string,
    icon: any,
    onNav: () => void
}

const TabBox = ({ title, icon, onNav }: Props) => {
    return (
        <TouchableOpacity
            className="flex justify-evenly items-center w-[31.5%] py-2 aspect-square bg-[#1A736A] rounded-xl"
            onPress={onNav}
        >
            <Image tintColor="#fff" source={icon} className="w-12 h-12" />
            <Text className="text-lg font-bold text-white text-center">{title}</Text>
        </TouchableOpacity>
    );
}

export default TabBox