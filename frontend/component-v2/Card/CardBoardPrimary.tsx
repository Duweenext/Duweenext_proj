// components/Esp32Card.tsx
import React from 'react';
import { View, Text, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Mode = 'connected' | 'failed' | 'disconnected';

interface Esp32CardProps {
    mode: Mode;
    runningTime?: string;      // e.g. "45 hours 32 minutes"
    lastConnected?: string;    // e.g. "05 April 2024 11:09 PM"
    onCardPress?: (e: GestureResponderEvent) => void;
    onButtonPress?: (e: GestureResponderEvent) => void;
}

const CardBoardPrimary: React.FC<Esp32CardProps> = ({
    mode,
    runningTime = '0 hours 0 minutes',
    lastConnected = '',
    onCardPress,
    onButtonPress,
}) => {
    const variants = {
        connected: {
           
        },
        failed: {
            
        },
        disconnected: {
            
        },
    } as const;

    const v = variants[mode];

    return (
        <TouchableOpacity
            onPress={onCardPress}
            className={`w-full h-32 p-4 flex items-center justify-center bg-primary `}
        >

        </TouchableOpacity>
    );
};

export default CardBoardPrimary;
