import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';

const OptionModal = ({
  visible,
  onSelectBle,
  onSelectManual,
  onClose,
}: {
  visible: boolean;
  onSelectBle: () => void;
  onSelectManual: () => void;
  onClose: () => void;
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View className='bg-white p-6 rounded-xl w-[80%] gap-2' >
          <Text className='font-bold text-xl'>Choose Configuration Method</Text>

          <View className='flex gap-2'>
            <TouchableOpacity onPress={onSelectManual} className='bg-white border-2 border-black p-5 rounded-lg'>
              <Text className='text-black'>Manual Configuration</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onSelectBle} className='bg-white border-2 border-black p-5 rounded-lg'>
              <Text className='text-black'>BLE Configuration</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onClose} className='bg-[#0D0D0D] p-3 rounded-lg'>
            <Text style={{ color: 'white' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default OptionModal;
