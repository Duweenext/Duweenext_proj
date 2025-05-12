import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const wifiSchema = z.object({
  ssid: z.string().min(1, 'SSID is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type WifiFormData = z.infer<typeof wifiSchema>;

interface SensorModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: WifiFormData) => void;
}

const SensorModal: React.FC<SensorModalProps> = ({ visible, onClose, onSubmit }) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<WifiFormData>({
    resolver: zodResolver(wifiSchema),
  });

  React.useEffect(() => {
    register('ssid');
    register('password');
  }, [register]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-center items-center bg-black/60 px-4">
        <View className="bg-white w-full p-5 rounded-xl">
          <Text className="text-lg font-bold mb-4 text-center">Wi-Fi Setup</Text>

          <Text className="text-sm font-medium">SSID</Text>
          <TextInput
            placeholder="Enter SSID"
            className="border border-gray-300 px-3 py-2 rounded-md mb-1"
            onChangeText={(text) => setValue('ssid', text)}
          />
          {errors.ssid && <Text className="text-red-500 text-sm mb-2">{errors.ssid.message}</Text>}

          <Text className="text-sm font-medium">Password</Text>
          <TextInput
            placeholder="Enter Password"
            secureTextEntry
            className="border border-gray-300 px-3 py-2 rounded-md mb-1"
            onChangeText={(text) => setValue('password', text)}
          />
          {errors.password && <Text className="text-red-500 text-sm mb-2">{errors.password.message}</Text>}

          <View className="flex-row justify-end gap-2 mt-4">
            <TouchableOpacity onPress={onClose} className="bg-gray-300 px-4 py-2 rounded-md">
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              className="bg-primary px-4 py-2 rounded-md"
            >
              <Text className="text-white">Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SensorModal;
