import { Image, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { images } from '@/constants/images';
import { icons } from '@/constants/icons';

// Status color mapping
const statusTabColorClassMap: Record<string, string> = {
    Connected: 'bg-primary',
    Disconnected: 'bg-[#D9D9D9]',
    UnableToConnect: 'bg-failed',
};

const statusTextColorClassMap: Record<string, string> = {
    Connected: 'text-white',
    Disconnected: 'text-black',
    UnableToConnect: 'text-white',
};

const buttonTextMap: Record<string, string> = {
    Connected: 'Disconnect',
    UnableToConnect: 'Connect Again',
    Disconnected: 'Connect',
};

// Mock sensor data
const mockSensors = [
    { name: 'Ph sensor', value: 20, status: 'Connected' },
    { name: 'Temp sensor', value: 25, status: 'Disconnected' },
    { name: 'EC sensor', value: 20, status: 'Connected' },
];

// Mock board status
const mockBoards = [
    {
        id: '1',
        name: 'ESP32',
        status: 'Connected',
        running_time: 45,
        sensors: mockSensors
    },
    {
        id: '2',
        name: 'ESP32',
        status: 'UnableToConnect',
        running_time: 0,
        sensors: []
    },
    {
        id: '3',
        name: 'ESP32',
        status: 'Disconnected',
        running_time: 0,
        last_connected: 23,
        sensors: []
    },
];

// Interface for sensor data
interface SensorData {
    name: string;
    value: number;
    status: string;
}

// Interface for board data
interface BoardData {
    id: string;
    name: string;
    status: string;
    running_time: number;
    last_connected?: number;
    sensors: SensorData[];
}

// Sensor Item Component - Used inside expanded board tabs
const SensorItem = ({ sensor }: { sensor: SensorData }) => {
    const textColor = statusTextColorClassMap[sensor.status] || 'text-white';
    const buttonText = buttonTextMap[sensor.status] || 'Reconnect';

    return (
        <View className="flex-1 bg-black/10 rounded-lg p-3 mb-2">
            <View className="flex-row justify-between items-center w-full">
                <View className="flex-1">
                    <Text className={`${textColor} font-medium text-sm`}>{sensor.name}</Text>
                    <Text className={`${textColor} font-normal text-xs`}>
                        Current value: {sensor.value}
                    </Text>
                    <Text className={`${textColor} font-normal text-xs`}>
                        Status: {sensor.status}
                    </Text>
                </View>

                <TouchableOpacity onPress={() => console.log(`${buttonText} ${sensor.name}`)}>
                    <View className="bg-white rounded-lg py-1 px-3 mr-2">
                        <Text className="font-medium text-black text-xs">{buttonText}</Text>
                    </View>
                </TouchableOpacity>

                <Image source={icons.right_arrow} style={{ height: 15, width: 15 }} />
            </View>
        </View>
    );
};

// Expandable Board Tab Component
const BoardTab = ({ board }: { board: BoardData }) => {
    const [expanded, setExpanded] = useState(false);
    const bgColor = statusTabColorClassMap[board.status] || 'bg-gray-200';
    const textColor = statusTextColorClassMap[board.status] || 'text-black';
    const buttonText = buttonTextMap[board.status] || 'Reconnect';

    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    return (
        <View className={`mb-3 rounded-xl overflow-hidden ${bgColor}`}>
            {/* Board header - always visible */}
            <TouchableOpacity onPress={toggleExpanded} activeOpacity={0.7}>
                <View className="px-4 py-4">
                    <View className="flex-row justify-between w-full items-center">
                        <Text className={`${textColor} font-medium text-lg`}>{board.name}</Text>
                        <Image
                            source={expanded ? icons.right_arrow || icons.right_arrow : icons.right_arrow}
                            style={{ height: 20, width: 20 }}
                        />
                    </View>

                    <View className="flex-row justify-between items-end w-full mt-1">
                        <View className="flex-1">
                            {board.status === 'Disconnected' && board.last_connected && (
                                <Text className={`${textColor} font-normal text-xs`}>
                                    Last Connected: {board.last_connected} hours
                                </Text>
                            )}

                            {(board.status === 'Connected' || board.status === 'Disconnected') && (
                                <Text className={`${textColor} font-normal text-xs`}>
                                    Running: {board.running_time} hours
                                </Text>
                            )}

                            {board.status === 'UnableToConnect' && (
                                <View className="flex-row gap-1 items-end">
                                    <Text className={`${textColor} font-normal text-xs`}>
                                        Why is it not connecting?
                                    </Text>
                                    <Image
                                        source={icons.question_mark}
                                        style={{ height: 15, width: 15 }}
                                    />
                                </View>
                            )}

                            <Text className={`${textColor} font-normal text-xs`}>Status: {board.status}</Text>
                        </View>

                        <TouchableOpacity onPress={() => console.log(`${buttonText} ${board.name}`)}>
                            <View className="bg-white rounded-lg py-1 px-4">
                                <Text className="font-medium text-black">{buttonText}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>

            {/* Expandable content - sensors list */}
            {expanded && board.status === 'Connected' && (
                <View className="px-4 pb-4">
                    {board.sensors.map((sensor, index) => (
                        <SensorItem key={index} sensor={sensor} />
                    ))}
                </View>
            )}
        </View>
    );
};

// Main Sensor Screen
const SensorScreen = () => {
    const onAddBoard = () => {
        console.log('Add board pressed');
    };

    return (
        <View className="flex-1 h-screen w-screen relative">
            <Image
                source={images.background}
                resizeMode="cover"
                style={{ flex: 1, width: '100%', height: '100%' }}
                className="absolute h-full w-full"
            />
            <View className="flex-1 px-4 py-5 gap-5">
                <View className="gap-2">
                    <View className='flex-row gap-1 items-center w-full'>
                        <Text className="font-semibold text-2xl text-white">Add board</Text>
                        <TouchableOpacity>
                            <Image source={icons.question_mark_white} style={{ height: 20, width: 20 }} />
                        </TouchableOpacity>
                    </View>
                    {/* Add board button */}
                    <TouchableOpacity
                        onPress={onAddBoard}
                        className="flex-1 p-5 bg-white rounded-2xl justify-center items-center"
                    >
                        <Image source={icons.add} style={{ height: 40, width: 40 }} />
                    </TouchableOpacity>
                </View>

                <View className="gap-2">
                    <Text className="font-semibold text-2xl text-white">Board</Text>
                    {/* Render all board tabs */}
                    {mockBoards.map((board) => (
                        <BoardTab key={board.id} board={board} />
                    ))}
                </View>
            </View>
        </View>
    );
};

export default SensorScreen;