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
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#1A736A',
                borderRadius: 12,
                paddingVertical: 16,
                paddingHorizontal: 8,
                aspectRatio: 1,
                maxWidth: '31%',
            }}
            onPress={onNav}
        >
            <Image 
                source={icon} 
                style={{ 
                    width: 32, 
                    height: 32, 
                    tintColor: '#ffffff',
                    marginBottom: 8,
                }} 
            />
            <Text style={{
                fontSize: 12,
                fontWeight: '600',
                color: '#ffffff',
                textAlign: 'center',
                lineHeight: 14,
            }}>
                {title}
            </Text>
        </TouchableOpacity>
    );
}

export default TabBox