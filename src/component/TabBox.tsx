import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'

interface Props {
    title: string,
    icon: any,
    onNav: () => void
    image_width?: number
    image_height?: number
}

const TabBox = ({ title, icon, onNav , image_width = 32, image_height = 32}: Props) => {
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
                    width: image_width, 
                    height: image_height, 
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