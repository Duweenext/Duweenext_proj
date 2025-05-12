import { Image, Text, TouchableOpacity, View, ScrollView, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { images } from '@/constants/images';
import { icons } from '@/constants/icons';
import { LinearGradient } from 'expo-linear-gradient';
import { DropDown } from '@/components/menu';
import OptionModal from '@/components/modal/sensor/optionalModal';
import ManualConfigModal from '@/components/modal/sensor/manuaModal';
import BleConfigModal from '@/components/modal/sensor/bleModal';
import WifiConfigModal, { WifiFormData } from '@/components/modal/sensor/wificonfigModal';

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
    { name: 'Temp sensor', value: 25, status: 'Connected' },
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
    const [expanded, setExpanded] = useState(false);
    const textColor = statusTextColorClassMap[sensor.status] || 'text-white';
    const buttonText = buttonTextMap[sensor.status] || 'Reconnect';
    const [selectedFreq, setSelectedFreq] = useState('Continous');

    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    const handleFreqSelect = (value: string) => {
        setSelectedFreq(value);
    };

    return (
        <TouchableOpacity onPress={toggleExpanded}>
            <View className="flex bg-primary rounded-lg mb-2">
                <View className='p-3'>
                    <View className="flex-row justify-between items-center w-full">
                        <View className="flex-1">
                            <Text className={`${textColor} font-medium text-lg`}>{sensor.name}</Text>
                            <Text className={`${textColor} font-normal text-sm`}>
                                Current value: {sensor.value}
                            </Text>
                            <Text className={`${textColor} font-normal text-sm`}>
                                Status: {sensor.status}
                            </Text>
                        </View>

                        {/* <TouchableOpacity onPress={() => console.log(`${buttonText} ${sensor.name}`)}>
                            <View className="bg-white rounded-lg py-1 px-3 mr-2">
                                <Text className="font-medium text-black text-xs">{buttonText}</Text>
                            </View>
                        </TouchableOpacity> */}

                        <Image source={icons.right_arrow} style={{ height: 15, width: 15 }} />
                    </View>
                </View>
                {expanded && (

                    <View className="py-4 px-3 bg-white rounded-b-lg gap-2">
                        <View className='flex-row justify-between'>
                            <View className='flex gap-3'>
                                <View className='flex-row gap-1 items-center w-full '>
                                    <Text className="font-semibold text-lg text-black">Threshold</Text>
                                    <TouchableOpacity>
                                        <Image source={icons.question_mark} className='h-5 w-5' />
                                    </TouchableOpacity>
                                </View>
                                <View className='flex-row justify-between items-center'>
                                    <Text className="font-semibold text-lg text-black">Max: </Text>
                                    <TextInput className='border-2 border-black h-auto px-6 py-1 rounded-md' placeholder='5.5' />
                                </View>
                                <View className='flex-row justify-between items-center'>
                                    <Text className="font-semibold text-lg text-black">Max: </Text>
                                    <TextInput className='border-2 border-black h-auto px-6 py-1 rounded-md' placeholder='5.5' />
                                </View>
                            </View>
                            <View>
                                <Text className="font-semibold text-lg text-black">Frequency</Text>
                                <DropDown
                                    options={['Continous', '3 per days', 'Manually']}
                                    selected={selectedFreq}
                                    onSelect={handleFreqSelect}
                                    buttonText="Select Graph"
                                />
                            </View>
                        </View>
                        <View>
                            <Text className='font-semibold text-lg'>Summary</Text>
                        </View>
                    </View>
                )}
            </View>
        </TouchableOpacity>
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
                                <Text className={`${textColor} font-normal text-sm`}>
                                    Last Connected: {board.last_connected} hours
                                </Text>
                            )}

                            {(board.status === 'Connected' || board.status === 'Disconnected') && (
                                <Text className={`${textColor} font-normal text-sm`}>
                                    Running: {board.running_time} hours
                                </Text>
                            )}

                            {board.status === 'UnableToConnect' && (
                                <View className="flex-row gap-1 items-end">
                                    <Text className={`${textColor} font-normal text-sm`}>
                                        Why is it not connecting?
                                    </Text>
                                    <Image
                                        source={icons.question_mark}
                                        style={{ height: 15, width: 15 }}
                                    />
                                </View>
                            )}

                            <Text className={`${textColor} font-normal text-sm`}>Status: {board.status}</Text>
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
                // <View className="p-5">
                <LinearGradient
                    colors={['#95E7E7', '#5A9696']}
                    style={{ padding: 10 }}
                    start={{ x: 0, y: 0 }} // top
                    end={{ x: 0, y: 1 }}   // bottom
                >
                    {/* Mapping over sensors */}
                    <View className='px-1'>
                        {board.sensors.map((sensor, index) => (
                            <SensorItem key={index} sensor={sensor} />
                        ))}
                    </View>
                </LinearGradient>
                // </View>
            )
            }
        </View >
    );
};

// Main Sensor Screen
const SensorScreen = () => {

    const [showOptionModal, setShowOptionModal] = useState(false);
    const [showManualModal, setShowManualModal] = useState(false);
    const [showBleModal, setShowBleModal] = useState(false);
    const [showWifiConfig, setShowWifiConfig] = useState(false);

    const [boardId, setBoardId] = useState('');

    const openOptionModal = () => {
        setShowOptionModal(true);
    };

    const handleManualSelect = () => {
        setShowOptionModal(false);
        setShowManualModal(true);
    };

    const handleBleSelect = () => {
        setShowOptionModal(false);
        setShowBleModal(true);
    };

    const handleCloseAll = () => {
        setShowOptionModal(false);
        setShowManualModal(false);
        setShowBleModal(false);
        setShowWifiConfig(false);
    };

    const handleDeviceSelect = (selectedId: string) => {
        setBoardId(selectedId);
        setShowBleModal(false);
        setShowWifiConfig(true);
    };

    const onAddBoard = () => {
        openOptionModal();
    };

    const handleWifiSubmit = (data: WifiFormData) => {
        console.log('Wi-Fi Config Submitted:', data);
        handleCloseAll();
    };

    useEffect(() => {
        if (boardId) {
            console.log('Board ID updated:', boardId);
        }
    }, [boardId]);


    return (
        <ScrollView>
            <OptionModal
                visible={showOptionModal}
                onSelectBle={handleBleSelect}
                onSelectManual={handleManualSelect}
                onClose={() => setShowOptionModal(false)}
            />

            <ManualConfigModal
                visible={showManualModal}
                onClose={handleCloseAll}
            />

            <BleConfigModal
                visible={showBleModal}
                onClose={handleCloseAll}
                onSelectDevice={handleDeviceSelect}
            />


            <WifiConfigModal
                visible={showWifiConfig}
                onClose={handleCloseAll}
                onSubmit={handleWifiSubmit}
                boardId={boardId}
            />

            <View className="flex-1 h-screen w-screen relative">
                <Image
                    source={images.background}
                    resizeMode="cover"
                    style={{ flex: 1, width: '100%', height: '100%' }}
                    className="absolute h-full w-full"
                />
                <View className="flex-1 justify-start px-4 py-2 gap-2">
                    {/* <View className="gap-2"> */}
                    <View className='flex-row gap-1 items-center w-full'>
                        <Text className="font-semibold text-2xl text-white">Add board</Text>
                        <TouchableOpacity>
                            <Image source={icons.question_mark_white} className='h-5 w-5' />
                        </TouchableOpacity>
                    </View>
                    {/* Add board button */}
                    <TouchableOpacity
                        onPress={onAddBoard}
                        className="flex p-10 bg-white rounded-2xl justify-center items-center"
                    >
                        <Image source={icons.add} className='h-8 w-8' />
                    </TouchableOpacity>
                    {/* </View> */}

                    <View className="gap-2">
                        <Text className="font-semibold text-2xl text-white">Board</Text>
                        {/* Render all board tabs */}
                        {mockBoards.map((board) => (
                            <BoardTab key={board.id} board={board} />
                        ))}
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

export default SensorScreen;