import React from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput } from 'react-native'; // Removed StyleSheet
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Zod schema for validation
const schema = z.object({
  boardId: z.string().min(1, 'Board ID is required'),
  wifiSsid: z.string().min(1, 'WiFi SSID is required'),
  wifiPassword: z.string().min(1, 'WiFi Password is required'),
});

type FormData = z.infer<typeof schema>;

const ManualConfigModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
        boardId: '',
        wifiSsid: '',
        wifiPassword: '',
    }
  });

  const onSubmit = (data: FormData) => {
    console.log('Submitted Data:', data);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white p-6 rounded-lg w-11/12 max-w-sm shadow-lg">
          <Text className="text-xl font-bold mb-5 text-center text-gray-800">Enter Configuration</Text>

          {/* Board ID Input */}
          <Text className="text-base text-gray-700 mb-1 mt-2.5">Board ID</Text>
          <Controller
            control={control}
            name="boardId"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                className="border border-gray-300 px-4 py-3 rounded-md text-base mb-1"
                placeholder="Enter Board ID"
                placeholderTextColor="#9ca3af" // Equivalent to placeholder-gray-400
              />
            )}
          />
          {errors.boardId && <Text className="text-red-600 text-sm mb-2.5">{errors.boardId.message}</Text>}

          {/* WiFi SSID Input */}
          <Text className="text-base text-gray-700 mb-1 mt-2.5">WiFi SSID</Text>
          <Controller
            control={control}
            name="wifiSsid"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                className="border border-gray-300 px-4 py-3 rounded-md text-base mb-1"
                placeholder="Enter WiFi SSID"
                placeholderTextColor="#9ca3af"
              />
            )}
          />
          {errors.wifiSsid && <Text className="text-red-600 text-sm mb-2.5">{errors.wifiSsid.message}</Text>}

          {/* WiFi Password Input */}
          <Text className="text-base text-gray-700 mb-1 mt-2.5">WiFi Password</Text>
          <Controller
            control={control}
            name="wifiPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                className="border border-gray-300 px-4 py-3 rounded-md text-base mb-1"
                placeholder="Enter WiFi Password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
              />
            )}
          />
          {errors.wifiPassword && <Text className="text-red-600 text-sm mb-2.5">{errors.wifiPassword.message}</Text>}

          <View className="flex-row justify-between mt-6">
            <TouchableOpacity
              onPress={onClose}
              className="bg-gray-500 py-3 px-5 rounded-md items-center flex-1 mr-2.5" // mr-2.5 for 10px
            >
              <Text className="text-white font-bold text-base">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              className="bg-green-600 py-3 px-5 rounded-md items-center flex-1 ml-2.5" // ml-2.5 for 10px
            >
              <Text className="text-white font-bold text-base">Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ManualConfigModal;