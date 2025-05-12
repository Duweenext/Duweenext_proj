import React from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Zod schema for validation
const schema = z.object({
  boardId: z.string().min(1, 'Board ID is required'),
});

type FormData = {
  boardId: string;
};

const ManualConfigModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log('Submitted Board ID:', data.boardId);
    onClose(); // Close modal after submission
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Enter Board ID</Text>

          <Controller
            control={control}
            name="boardId"
            render={({ field }) => (
              <TextInput
                {...field}
                style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
                placeholder="Enter Board ID"
              />
            )}
          />
          {errors.boardId && <Text style={{ color: 'red' }}>{errors.boardId.message}</Text>}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
            <TouchableOpacity onPress={onClose} style={{ backgroundColor: 'gray', padding: 10, borderRadius: 5 }}>
              <Text style={{ color: 'white' }}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSubmit(onSubmit)} style={{ backgroundColor: 'green', padding: 10, borderRadius: 5 }}>
              <Text style={{ color: 'white' }}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ManualConfigModal;
