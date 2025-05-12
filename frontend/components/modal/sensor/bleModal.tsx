import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';

const mockBoards = [
  { id: '1112', name: 'ESP32', status: 'Connected' },
  { id: '2232', name: 'ESP32', status: 'UnableToConnect' },
  { id: '3421', name: 'ESP32', status: 'Disconnected' },
];

const BleConfigModal = ({
  visible,
  onClose,
  onSelectDevice,
}: {
  visible: boolean;
  onClose: () => void;
  onSelectDevice: (boardId: string) => void;
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Select Board for BLE Configuration</Text>

          <ScrollView style={{ marginTop: 20 }}>
            {mockBoards.map((board) => (
              <View key={board.id} style={{ marginBottom: 10 }}>
                <Text>{board.name} (ID: {board.id})</Text>
                <TouchableOpacity onPress={() => onSelectDevice(board.id)} style={{ backgroundColor: 'white', padding: 10, borderRadius: 5, marginTop: 5 , borderWidth: 1, borderColor: 'black'}}>
                  <Text style={{ color: 'black' }}>Connect</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity onPress={onClose} style={{ marginTop: 20, backgroundColor: 'gray', padding: 10, borderRadius: 5 }}>
            <Text style={{ color: 'white' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default BleConfigModal;
