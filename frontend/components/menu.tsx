import { icons } from '@/constants/icons';
import React, { useState } from 'react';
import { View, Text, Image } from 'react-native';
import { Menu, Button } from 'react-native-paper';

interface DropDownProps {
    options: string[]; 
    selected: string; 
    onSelect: (value: string) => void; 
    buttonText: string; 
}

export const DropDown: React.FC<DropDownProps> = ({ options, selected, onSelect, buttonText }) => {
    const [visible, setVisible] = useState(false);

    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    const handleSelect = (option: string) => {
        onSelect(option);
        closeMenu();
    }

    return (
        <Menu
            visible={visible}
            onDismiss={closeMenu}
            anchor={
                <Button onPress={openMenu}>
                    <View className="flex-row justify-between items-center p-2 w-auto self-end border-black rounded-lg border-2 bg-white">
                        <Image source={icons.down_arrow} className="size-6" />
                        <Text className="text-black">{selected === null ? options[0] : selected}</Text>
                    </View>
                </Button>
            }
        >
            {options.map((option, index) => (
                <Menu.Item key={index} onPress={() => handleSelect(option)} title={option} />
            ))}
        </Menu>
    );
};
